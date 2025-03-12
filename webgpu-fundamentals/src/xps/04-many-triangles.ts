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

const rand = (min?: number, max?: number) => {
  if (min === undefined) {
    min = 0;
    max = 1;
  } else if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + Math.random() * (max - min);
};

// byte offsets
const offsets = {
  color: 0,
  scale: 4,
  offset: 6,
};

const uniformBufferSize =
  4 * 4 + // color is 32f (4xrgba)
  2 * 4 + // scale is 2x32f (x,y)
  2 * 4; // offset is 2x32f (x,y)

function createUniformBuffer(
  device: GPUDevice,
  pipeline: GPURenderPipeline,
): {
  scale: number;
  uniformBuffer: GPUBuffer;
  uniformValues: Float32Array<any>;
  bindGroup: GPUBindGroup;
}[] {
  const objectCount = 100;
  const objectInfos = [];

  for (let i = 0; i < objectCount; ++i) {
    const uniformBuffer = device.createBuffer({
      size: uniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const bindGroup = device.createBindGroup({
      label: `bgt-${i}`,
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
    });
    const uniformValues = new Float32Array(uniformBufferSize / 4); // byte size to float32 size (4 bytes each)
    uniformValues.set([rand(), rand(), rand(), 1], offsets.color);
    uniformValues.set([rand(), rand()], offsets.offset);
    objectInfos.push({
      scale: rand(0.2, 0.5),
      uniformBuffer,
      uniformValues,
      bindGroup,
    });
  }
  return objectInfos;
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
  const objectInfos = createUniformBuffer(device, pipeline);
  // the texture we will render to
  const triangleRenderPassDescriptor = (
    ctx: GPUCanvasContext,
  ): GPURenderPassDescriptor => ({
    label: "basic render pass",
    colorAttachments: [
      {
        view: ctx.getCurrentTexture().createView(),
        clearValue: [0.16, 0.16, 0.53, 0],
        loadOp: "clear", // clear the texture before storing
        storeOp: "store", // store the result (as opposed to discard)
      },
    ],
  });
  function render() {
    const renderPassDescriptor = triangleRenderPassDescriptor(ctx);
    const encoder = device.createCommandEncoder({ label: "our encoder " });
    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
    // pass.setBindGroup(0, bindGroup);
    const aspect = ctx.canvas.width / ctx.canvas.height;
    for (const {
      scale,
      bindGroup,
      uniformBuffer,
      uniformValues,
    } of objectInfos) {
      uniformValues.set([scale / aspect, scale], offsets.scale);
      device.queue.writeBuffer(uniformBuffer, 0, uniformValues);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
    }
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
