import { Pane } from "tweakpane";
import { debug, initWGPUCanvas, resizeCanvas } from "../common";
import { Scene } from "../main";

const createShader = (device: GPUDevice) =>
  device.createShaderModule({
    label: "rings storage shaders",
    code: `
struct OurStruct {
  color: vec4f,
  offset: vec2f,
};

struct ScaleStruct {
  scale: vec2f,
}

struct Vertex {
  position: vec2f,
}

@group(0) @binding(0) var<storage, read> ourStructs: array<OurStruct>;
@group(0) @binding(1) var<storage, read> otherStructs: array<ScaleStruct>;
@group(0) @binding(2) var<storage, read> pos: array<Vertex>;

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
}

@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32,
  @builtin(instance_index) instanceIndex : u32
) -> VSOutput {
  let otherStruct = otherStructs[instanceIndex];
  let ourStruct = ourStructs[instanceIndex];

  var vsOut: VSOutput;
  vsOut.position = vec4f(pos[vertexIndex].position * otherStruct.scale + ourStruct.offset, 0.0, 1.0);
  vsOut.color = ourStruct.color;
  return vsOut;
}

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  return vsOut.color;
}
`,
  });

function createCircleVertices({
  radius = 1,
  subdivisions = 24,
  innerRadius = 24,
  startAngle = 0,
  endAngle = Math.PI * 2,
} = {}) {
  // 2 triangles per subdivision, 3 verts per tri, 2 values (xy) each
  const numVertices = subdivisions * 3 * 2;
  const vertexData = new Float32Array(subdivisions * 2 * 3 * 2);

  let offset = 0;
  const addVertex = (x: number, y: number) => {
    vertexData[offset++] = x;
    vertexData[offset++] = y;
  };

  // 2 triangles per subdivision
  // 0--1 4
  // | / / |
  // |/ /  |
  // 2  3--5
  for (let i = 0; i < subdivisions; ++i) {
    const angle1 =
      startAngle + ((i + 0) * (endAngle - startAngle)) / subdivisions;
    const angle2 =
      startAngle + ((i + 1) * (endAngle - startAngle)) / subdivisions;

    const c1 = Math.cos(angle1);
    const s1 = Math.sin(angle1);
    const c2 = Math.cos(angle2);
    const s2 = Math.sin(angle2);

    // first triangle
    addVertex(c1 * radius, s1 * radius);
    addVertex(c2 * radius, s2 * radius);
    addVertex(c1 * innerRadius, s1 * innerRadius);

    // second triangle
    addVertex(c1 * innerRadius, s1 * innerRadius);
    addVertex(c2 * radius, s2 * radius);
    addVertex(c2 * innerRadius, s2 * innerRadius);
  }
  return {
    vertexData,
    numVertices,
  };
}

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

const staticUnitSize =
  4 * 4 + // color is 4x32f (4xrgba)
  2 * 4 + // offset is 2x32f (x,y)
  2 * 4; // padding

function createStaticBuffer(device: GPUDevice, qty = 1000) {
  const size = staticUnitSize * qty;

  const buffer = device.createBuffer({
    label: `static storage for objects`,
    size: size,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const values = new Float32Array(size / 4);
  for (let i = 0; i < qty; ++i) {
    const staticOffset = i * (staticUnitSize / 4);
    // Only set once
    values.set([rand(), rand(), rand(), 1], staticOffset + offsets.color);
    values.set(
      [rand(-0.9, 0.9), rand(-0.9, 0.9)],
      staticOffset + offsets.offset,
    );

    device.queue.writeBuffer(buffer, 0, values);
  }

  return {
    buffer,
    values,
  };
}

const dynamicUnitSize = 2 * 4; // scale is 2x32f (x,y) i.e. 8 bytes

function createDynamicBuffer(device: GPUDevice, qty = 1000) {
  const size = dynamicUnitSize * qty; // 1000 x 8 bytes

  const buffer = device.createBuffer({
    label: `dynamic storage for objects`,
    size: size,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const values = new Float32Array(size / 4); // 1000 * 2 * Float 32s
  return {
    buffer,
    values,
  };
}

function createVertexBuffer(device: GPUDevice) {
  const { vertexData, numVertices } = createCircleVertices({
    radius: 0.5,
    innerRadius: 0.25,
  });
  console.log(vertexData);
  const buffer = device.createBuffer({
    label: "storage buffer vertices",
    size: vertexData.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(buffer, 0, vertexData);
  return [buffer, numVertices] as [GPUBuffer, number];
}

async function manyRings(el: HTMLElement) {
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

  const qty = 1000;
  const objectInfos: { scale: number }[] = [];
  for (let i = 0; i < qty; ++i) {
    objectInfos.push({
      scale: rand(0.2, 0.5),
    });
  }

  const { buffer: dynamicBuffer, values: dynamicValues } = createDynamicBuffer(
    device,
    qty,
  );
  const { buffer: staticBuffer, values: staticValues } = createStaticBuffer(
    device,
    qty,
  );
  device.queue.writeBuffer(staticBuffer, 0, staticValues);

  const [vertexBuffer, numVertices] = createVertexBuffer(device);

  const bindGroup = device.createBindGroup({
    label: `object-bind-group`,
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: staticBuffer } },
      { binding: 1, resource: { buffer: dynamicBuffer } },
      { binding: 2, resource: { buffer: vertexBuffer } },
    ],
  });
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
    const aspect = ctx.canvas.width / ctx.canvas.height;

    objectInfos.forEach(({ scale }, ndx) => {
      const offset = ndx * (dynamicUnitSize / 4);
      dynamicValues.set([scale / aspect, scale], offset + offsets.scale);
    });
    device.queue.writeBuffer(dynamicBuffer, 0, dynamicValues);

    pass.setBindGroup(0, bindGroup);
    pass.draw(numVertices, qty);
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
    debug(ctx);
  }
  resizeCanvas(ctx.canvas as HTMLCanvasElement, device, render);
  return () => pane.dispose();
}

export const manyRingsScene: Scene = {
  title: "Many Rings",
  description: `Rendering many rings using a storage buffer (see <a href="https://webgpufundamentals.org/webgpu/lessons/webgpu-uniforms.html" target="_blank" rel="noopener noreferrer">webgpufundamentals.com</a>)`,
  func: manyRings,
};
