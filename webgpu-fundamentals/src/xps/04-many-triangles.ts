import { debug, initWGPUCanvas, resizeCanvas } from "../common";
import { Scene } from "../main";

const createShader = (device: GPUDevice) =>
  device.createShaderModule({
    label: "manytriangles shaders",
    code: `
struct OurStruct {
  color: vec4f,
  offset: vec2f,
};

struct ScaleStruct {
  scale: vec2f,
}

@group(0) @binding(0) var<uniform> ourStruct: OurStruct;
@group(0) @binding(1) var<uniform> scaleStruct: ScaleStruct;

@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32
) -> @builtin(position) vec4f {
  let pos = array(
    vec2f(0.0, 0.5), // top center
    vec2f(-0.5, -0.5), // bottom left
    vec2f(0.5, -0.5), // bottom right
  );
  return vec4f(
    pos[vertexIndex] * scaleStruct.scale + ourStruct.offset, 0.0, 1.0);
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
  offset: 4,
  scale: 0,
};

const staticUniformBufferSize =
  4 * 4 + // color is 32f (4xrgba)
  2 * 4 + // offset is 2x32f (x,y)
  2 * 4; // padding

const scaleBufferSize = 2 * 4; // scale is 2x32f (x,y)

function createUniformBuffer(
  device: GPUDevice,
  pipeline: GPURenderPipeline,
): {
  scale: number;
  uniformBuffer: GPUBuffer;
  uniformValues: Float32Array<any>;
  bindGroup: GPUBindGroup;
}[] {
  const objectCount = 1000;
  const objectInfos = [];

  for (let i = 0; i < objectCount; ++i) {
    // color/offset buffer (static)
    const staticUniformBuffer = device.createBuffer({
      label: `static uniform ${i}`,
      size: staticUniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const uniformValues = new Float32Array(staticUniformBufferSize / 4);
    uniformValues.set([rand(), rand(), rand(), 1], offsets.color);
    uniformValues.set([rand(-1, 1), rand(-0.2, 0.2)], offsets.offset);
    device.queue.writeBuffer(staticUniformBuffer, 0, uniformValues);

    // Scale buffer (dynamic)
    const scaleValues = new Float32Array(scaleBufferSize / 4);
    const scaleBuffer = device.createBuffer({
      label: `changing uniforms for obj: ${i}`,
      size: scaleBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroup = device.createBindGroup({
      label: `bgt-${i}`,
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: staticUniformBuffer } },
        { binding: 1, resource: { buffer: scaleBuffer } },
      ],
    });

    objectInfos.push({
      scale: rand(0.1, 0.25),
      uniformBuffer: scaleBuffer,
      uniformValues: scaleValues,
      bindGroup,
    });
  }
  return objectInfos;
}

export async function manyTriangles(el: HTMLElement) {
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
  resizeCanvas({ canvas: ctx.canvas as HTMLCanvasElement, device, cb: render });
}

export const manyTriScene: Scene = {
  title: "Many Triangles",
  description: `Rendering many triangles using a uniform buffer (see <a href="https://webgpufundamentals.org/webgpu/lessons/webgpu-uniforms.html" target="_blank" rel="noopener noreferrer">webgpufundamentals.com</a>)`,
  func: manyTriangles,
};
