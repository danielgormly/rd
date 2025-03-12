import { Pane } from "tweakpane";
import { debug, initWGPUCanvas, resizeCanvas } from "../common";
import { Scene } from "../main";

const createShader = (device: GPUDevice) =>
  device.createShaderModule({
    label: "manytriangles shaders",
    code: `
struct OurStruct {
  color: vec4f,
  scale: vec2f,
  offset: vec2f,
};

@group(0) @binding(0) var<uniform> ourStruct: OurStruct;

@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32
) -> @builtin(position) vec4f {
  let pos = array(
    vec2f(0.0, 0.5), // top center
    vec2f(-0.5, -0.5), // bottom left
    vec2f(0.5, -0.5), // bottom right
  );
  return vec4f(
    pos[vertexIndex] * ourStruct.scale + ourStruct.offset, 0.0, 1.0);
}

@fragment fn fs() -> @location(0) vec4f {
  return ourStruct.color;
}
`,
  });

function createUniformBuffer(
  device: GPUDevice,
): [
  GPUBuffer,
  Float32Array<ArrayBuffer>,
  { color: number; scale: number; offset: number },
] {
  const uniformBufferSize =
    4 * 4 + // color is 32f (4xrgba)
    2 * 4 + // scale is 2x32f (x,y)
    2 * 4; // offset is 2x32f (x,y)
  const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const uniformValues = new Float32Array(uniformBufferSize / 4); // byte size to float32 size (4 bytes each)
  // byte offsets
  const offsets = {
    color: 0,
    scale: 4,
    offset: 6,
  };
  uniformValues.set([0, 1, 0, 1], offsets.color); // set the color
  uniformValues.set([-0.5, -0.25], offsets.offset); // set the offset
  return [uniformBuffer, uniformValues, offsets];
}

export async function manyTriangles(el: HTMLElement) {
  const pane = new Pane();
  const [ctx, device, format] = await initWGPUCanvas(el, true);

  const shader = createShader(device);
  const pipeline = device.createRenderPipeline({
    label: "hardcoded checkerboard triangle pipeline",
    layout: "auto",
    vertex: {
      module: shader,
    },
    fragment: {
      module: shader,
      targets: [{ format }], // pos 0 aligns with fragment shader output (location 0) ?
    },
  });
  const [uniformBuffer, uniformValues, offsets] = createUniformBuffer(device);
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });
  // the texture we will render to
  const triangleRenderPassDescriptor = (
    view: GPUTextureView,
  ): GPURenderPassDescriptor => ({
    label: "basic render pass",
    colorAttachments: [
      {
        view,
        clearValue: [0.16, 0.16, 0.53, 0],
        loadOp: "clear", // clear the texture before storing
        storeOp: "store", // store the result (as opposed to discard)
      },
    ],
  });
  function render() {
    const aspect = ctx.canvas.width / ctx.canvas.height;
    uniformValues.set([0.5 / aspect, 0.5], offsets.scale);
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);
    const renderPassDescriptor = triangleRenderPassDescriptor(
      ctx.getCurrentTexture().createView(),
    );
    const encoder = device.createCommandEncoder({ label: "our encoder " });
    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3); // call our vertex shader 3 times
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
    debug(ctx);
  }
  resizeCanvas(ctx.canvas as HTMLCanvasElement, device, render);
  return () => pane.dispose();
}

export const manyTriScene: Scene = {
  title: "Many Triangles",
  description: `Rendering many triangles using a uniform var (see <a href="https://webgpufundamentals.org/webgpu/lessons/webgpu-uniforms.html" target="_blank" rel="noopener noreferrer">webgpufundamentals.com</a>)`,
  func: manyTriangles,
};
