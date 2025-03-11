import { Pane } from "tweakpane";
import { debug, initWGPUCanvas, resizeCanvas } from "../common";
import { Scene } from "../main";

const vsCode = `
struct OurVertexShaderOutput {
  @builtin(position) position: vec4f,
};
// vertex shader
@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32
) -> OurVertexShaderOutput {
  let pos = array(
    vec2f(0.0, 1), // top center
    vec2f(-1, -1), // bottom left
    vec2f(1, -1), // bottom right
  );
  var vsOutput: OurVertexShaderOutput;
  vsOutput.position = vec4f(pos[vertexIndex], 0.0, 1.0);
  return vsOutput;
}
`;

const fsCode = `
  struct OurVertexShaderOutput {
    @builtin(position) position: vec4f,
  };
  // fragment shader returning the colour red @ all points
  @fragment fn fs(fsInput: OurVertexShaderOutput) -> @location(0) vec4f {
    let red = vec4f(1, 0, 0, 1);
    let cyan = vec4f(0, 1, 1, 1);

    let grid = vec2u(fsInput.position.xy) / 10;
    let checker = (grid.x + grid.y) % 2 == 1;

    return select(red, cyan, checker);
  }`;

export async function checkerboardTriangle(el: HTMLElement) {
  const pane = new Pane();
  const [ctx, device, format] = await initWGPUCanvas(el, true);
  const vsModule = device.createShaderModule({
    label: "checkerboard vertex",
    code: vsCode,
  });
  const fsModule = device.createShaderModule({
    label: "checkerboard vertex",
    code: fsCode,
  });
  const pipeline = device.createRenderPipeline({
    label: "hardcoded checkerboard triangle pipeline",
    layout: "auto",
    vertex: {
      module: vsModule,
    },
    fragment: {
      module: fsModule,
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
  resizeCanvas(ctx.canvas as HTMLCanvasElement, device, render);
  return () => pane.dispose();
}

export const checkerboardTriScene: Scene = {
  title: "Checkerboard Triangle",
  description: `Checkerboard defined with reference to pixel values - so doesn't scale with the screen! (see <a href="https://webgpufundamentals.org/webgpu/lessons/webgpu-inter-stage-variables.html" target="_blank" rel="noopener noreferrer">webgpufundamentals.com</a>)`,
  func: checkerboardTriangle,
};
