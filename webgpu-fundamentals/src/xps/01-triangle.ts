import { initWGPUCanvas } from "../canvas";

// Notes:
// A vertex shader & a fragment shader
// Its argument vertex_index is a builtin, returning a 32-bit unsigned int
// returns a vec4f (object with 4x floating point vecs) assigned to the "position" builtin
// Positions are returned in clipspace (-1<x<1, -1<y<1)
const hardcodedTriangle = `
// vertex shader
@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32
) -> @builtin(position) vec4f {
  let pos = array(
    vec2f(0.0, 0.25), // top center
    vec2f(-0.125, -0.25), // bottom left
    vec2f(0.125, -0.25), // bottom right
  );
  return vec4f(pos[vertexIndex], 0.0, 1.0);
}

// fragment shader returning the colour red @ all points
@fragment fn fs() -> @location(0) vec4f {
    return vec4f(0.74, 0.45, 0.45, 1.0);
}
`;

export async function triangle(el: HTMLElement) {
  const [ctx, device, format] = await initWGPUCanvas(el, true);
  const module = device.createShaderModule({
    label: "hardcoded red triangle shader",
    code: hardcodedTriangle,
  });
  const pipeline = device.createRenderPipeline({
    label: "hardcoded red triangle pipeline",
    layout: "auto",
    vertex: {
      // entryPoint: 'vs', (redundant as there's only one!)
      module,
    },
    fragment: {
      // entryPoint: 'fs', (redundant as there's only one!)
      module,
      targets: [{ format }], // pos 0 aligns with fragment shader output (location 0) ?
    },
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
    const renderPassDescriptor = triangleRenderPassDescriptor(
      ctx.getCurrentTexture().createView(),
    );
    const encoder = device.createCommandEncoder({ label: "our encoder " });
    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
    pass.draw(3); // call our vertex shader 3 times
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  }
  render();
}
