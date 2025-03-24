import { debug, initWGPUCanvas, resizeCanvas } from "../common";
import { Scene } from "../main";

const createShader = (device: GPUDevice) =>
  device.createShaderModule({
    label: "textured rings shaders",
    code: `
struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
}

@vertex fn vs(
  @location(0) position: vec2f,
  @location(1) color: vec4f,
  @location(2) offset: vec2f,
  @location(3) scale: vec2f,
  @location(4) perVertexColor: vec4f
) -> VSOutput {
  var vsOut: VSOutput;
  vsOut.position = vec4f(
    position * scale + offset, 0.0, 1.0);
  vsOut.color = color * perVertexColor;
  return vsOut;
}

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  return vsOut.color;
}
`,
  });

function createCircleVertices({
  radius = 1,
  numSubdivisions = 24,
  innerRadius = 24,
  startAngle = 0,
  endAngle = Math.PI * 2,
} = {}) {
  // 2 triangles per subdivision, 3 verts per tri, 2 values (xy) each
  const numVertices = (numSubdivisions + 1) * 2;
  const vertexData = new Float32Array(numVertices * (2 + 1));
  const colorData = new Uint8Array(vertexData.buffer);

  let offset = 0;
  let colorOffset = 8;
  const addVertex = (x: number, y: number, r: number, g: number, b: number) => {
    vertexData[offset++] = x;
    vertexData[offset++] = y;
    offset += 1; // skip the colour
    colorData[colorOffset++] = r * 255;
    colorData[colorOffset++] = g * 255;
    colorData[colorOffset++] = b * 255;
    colorOffset += 9; // skip extra byte and the position
  };

  const innerColor = [1, 1, 1];
  const outerColor = [0.5, 0.5, 0.5];

  // 2 triangles per subdivision
  //
  // 0  2  4  6  8 ...
  //
  // 1  3  5  7  9 ...
  for (let i = 0; i <= numSubdivisions; ++i) {
    const angle =
      startAngle + ((i + 0) * (endAngle - startAngle)) / numSubdivisions;

    const c1 = Math.cos(angle);
    const s1 = Math.sin(angle);

    addVertex(c1 * radius, s1 * radius, ...outerColor);
    addVertex(c1 * innerRadius, s1 * innerRadius, ...innerColor);
  }

  const indexData = new Uint32Array(numSubdivisions * 6);
  let ndx = 0;

  // 1st tri  2nd tri  3rd tri  4th tri
  // 0 1 2    2 1 3    2 3 4    4 3 5
  //
  // 0--2        2     2--4        4  .....
  // | /        /|     | /        /|
  // |/        / |     |/        / |
  // 1        1--3     3        3--5  .....
  for (let i = 0; i < numSubdivisions; ++i) {
    const ndxOffset = i * 2;

    // first triangle
    indexData[ndx++] = ndxOffset;
    indexData[ndx++] = ndxOffset + 1;
    indexData[ndx++] = ndxOffset + 2;

    // second triangle
    indexData[ndx++] = ndxOffset + 2;
    indexData[ndx++] = ndxOffset + 1;
    indexData[ndx++] = ndxOffset + 3;
  }
  return {
    vertexData,
    indexData,
    numVertices: indexData.length,
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
  offset: 1,
  scale: 0,
};

const staticUnitSize =
  4 + // color is 4 bytes
  2 * 4; // offset is 2x32f (x,y)

function createStaticBuffer(device: GPUDevice, qty = 1000) {
  const size = staticUnitSize * qty;

  const buffer = device.createBuffer({
    label: `vertex storage for color & offset`,
    size: size,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  const u8Values = new Uint8Array(size);
  const f32Values = new Float32Array(u8Values.buffer);
  for (let i = 0; i < qty; ++i) {
    const offsetU8 = i * staticUnitSize;
    const offsetF32 = offsetU8 / 4;
    // Only set once
    u8Values.set(
      [rand(0.2, 1) * 255, 0.5 * 255, rand(0.9, 1) * 255, 255],
      offsetU8 + offsets.color,
    );
    f32Values.set(
      [rand(-0.9, 0.9), rand(-0.9, 0.9)],
      offsetF32 + offsets.offset,
    );
  }

  return {
    buffer,
    f32Values,
  };
}

const dynamicUnitSize = 2 * 4; // scale is 2x32f (x,y) i.e. 8 bytes

function createDynamicBuffer(device: GPUDevice, qty = 1000) {
  const size = dynamicUnitSize * qty; // 1000 x 8 bytes

  const buffer = device.createBuffer({
    label: `dynamic storage for objects`,
    size: size,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  const values = new Float32Array(size / 4); // 1000 * 2 * Float 32s
  return {
    buffer,
    values,
  };
}

function createVertexBuffer(device: GPUDevice) {
  const { vertexData, indexData, numVertices } = createCircleVertices({
    radius: 0.25,
    innerRadius: 0,
  });
  const buffer = device.createBuffer({
    label: "storage buffer vertices",
    size: vertexData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(buffer, 0, vertexData);
  const indexBuffer = device.createBuffer({
    label: "index buffer",
    size: indexData.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(indexBuffer, 0, indexData);
  return [buffer, numVertices, indexBuffer] as [GPUBuffer, number, GPUBuffer];
}

async function fakeBalls(el: HTMLElement) {
  const [ctx, device, format] = await initWGPUCanvas(el, true);

  const shader = createShader(device);
  const pipeline = device.createRenderPipeline({
    label: "hardcoded checkerboard triangle pipeline",
    layout: "auto",
    vertex: {
      module: shader,
      buffers: [
        {
          arrayStride: 2 * 4 + 4, // 2 floats, 4 bytes each
          attributes: [
            { shaderLocation: 0, offset: 0, format: "float32x2" }, // position
            { shaderLocation: 4, offset: 8, format: "unorm8x4" }, // perVertexColor
          ],
        },
        {
          arrayStride: 4 + 2 * 4, // 6 floats, 4 bytes each
          stepMode: "instance",
          attributes: [
            { shaderLocation: 1, offset: 0, format: "unorm8x4" },
            { shaderLocation: 2, offset: 4, format: "float32x2" },
          ],
        },
        {
          arrayStride: 2 * 4, // 2 floats, 4 bytes each
          stepMode: "instance",
          attributes: [
            { shaderLocation: 3, offset: 0, format: "float32x2" }, // scale
          ],
        },
      ],
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
  const { buffer: staticBuffer, f32Values: staticValues } = createStaticBuffer(
    device,
    qty,
  );
  device.queue.writeBuffer(staticBuffer, 0, staticValues);

  const [vertexBuffer, numVertices, indexBuffer] = createVertexBuffer(device);

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
    pass.setVertexBuffer(0, vertexBuffer);
    pass.setVertexBuffer(1, staticBuffer);
    pass.setVertexBuffer(2, dynamicBuffer);
    pass.setIndexBuffer(indexBuffer, "uint32");
    const aspect = ctx.canvas.width / ctx.canvas.height;

    objectInfos.forEach(({ scale }, ndx) => {
      const offset = ndx * (dynamicUnitSize / 4);
      dynamicValues.set([scale / aspect, scale], offset + offsets.scale);
    });
    device.queue.writeBuffer(dynamicBuffer, 0, dynamicValues);

    pass.drawIndexed(numVertices, qty);
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
    debug(ctx);
  }
  resizeCanvas(ctx.canvas as HTMLCanvasElement, device, render);
}

export const fakeBallsScene: Scene = {
  title: "Fake Balls",
  description: `Modifying our rings to use vertex buffer & reducing inner radius to 0 (see <a href="https://webgpufundamentals.org/webgpu/lessons/webgpu-uniforms.html" target="_blank" rel="noopener noreferrer">webgpufundamentals.com</a>)`,
  func: fakeBalls,
};
