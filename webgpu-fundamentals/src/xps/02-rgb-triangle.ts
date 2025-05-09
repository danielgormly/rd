import { debug, initWGPUCanvas, resizeCanvas } from "../common";
import { Scene } from "../main";

// re. @builtin(position) in vertex shader:
// not an inter-stage variable, the coordinate provided for output that the GPU uses to draw triangles/lines/points
// --- A clear line of demarcation ---
// This is separate to @builtin(position) in fragment shader
// an input, the pixel coordinate of the pixel that the fragment shader is currently being asked to compute a colour or value for
// Values provided to the center of the fragment shaders are CENTER coordinates of pixels, not pixel coordinates (edge coordinates)
const rgbTriangleCode = `
struct OurVertexShaderOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
};
// vertex shader
@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32
) -> OurVertexShaderOutput {
  let pos = array(
    vec2f(0.0, 0.25), // top center
    vec2f(-0.125, -0.25), // bottom left
    vec2f(0.125, -0.25), // bottom right
  );
  var color = array<vec4f, 3>(
    vec4f(1, 0, 0, 1), // red
    vec4f(0, 1, 0, 1), // green
    vec4f(0, 0, 1, 1), // blue
  );
  var vsOutput: OurVertexShaderOutput;
  vsOutput.position = vec4f(pos[vertexIndex], 0.0, 1.0);
  vsOutput.color = color[vertexIndex];
  return vsOutput;
}

// fragment shader returning the colour red @ all points
@fragment fn fs(fsInput: OurVertexShaderOutput) -> @location(0) vec4f {
  return fsInput.color;
}
`;

export async function rgbTriangle(el: HTMLElement) {
  const [ctx, device, format] = await initWGPUCanvas(el, true);
  const module = device.createShaderModule({
    label: "hardcoded rgb triangle shader",
    code: rgbTriangleCode,
  });
  const pipeline = device.createRenderPipeline({
    label: "hardcoded rgb triangle pipeline",
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
    debug(ctx);
  }
  resizeCanvas({ canvas: ctx.canvas as HTMLCanvasElement, device, cb: render });
}

export const rgbTriScene: Scene = {
  title: "RGB Triangle",
  description: `Using an interstage variable to interpolate colours across a triangle (see <a href="https://webgpufundamentals.org/webgpu/lessons/webgpu-inter-stage-variables.html" target="_blank" rel="noopener noreferrer">webgpufundamentals.com</a>)`,
  func: rgbTriangle,
};
