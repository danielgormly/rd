import { Pane } from "tweakpane";
import { debug, initWGPUCanvas, resizeCanvas } from "../common";
import { Scene } from "../main";

const texturesCode = `
struct OurVertexShaderOutput {
  @builtin(position) position: vec4f,
  @location(0) texcoord: vec2f,
};
// vertex shader
@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32
) -> OurVertexShaderOutput {
  let pos = array(
    // 1st triangle
    vec2f(0, 0), // center
    vec2f(1, 0), // right, center
    vec2f(0, 1), // center, top
    // 2nd triangle
    vec2f(0, 1), // center, top
    vec2f(1, 0), // right, center
    vec2f(1, 1), // right, top
  );
  var vsOutput: OurVertexShaderOutput;
  let xy = pos[vertexIndex];
  vsOutput.position = vec4f(xy, 0.0, 1.0);
  vsOutput.texcoord = xy; // interpolated between the 3 vertices of each triangle when passed to fragment shader
  return vsOutput;
}

@group(0) @binding(0) var ourSampler: sampler;
@group(0) @binding(1) var ourTexture: texture_2d<f32>;

// fragment shader returning the colour red @ all points
@fragment fn fs(fsInput: OurVertexShaderOutput) -> @location(0) vec4f {
  return textureSample(ourTexture, ourSampler, fsInput.texcoord);
}
`;

const textureDimensions = [5, 7];
const _ = [255, 0, 0, 255]; // red
const y = [255, 255, 0, 255]; // yellow
const b = [0, 0, 255, 255]; // blue
const textureData = new Uint8Array<any>(
  [
    [_, _, _, _, _],
    [_, y, _, _, _],
    [_, y, _, _, _],
    [_, y, y, _, _],
    [_, y, _, _, _],
    [_, y, y, y, _],
    [b, _, _, _, _],
  ].flat(2),
);

export async function textures(el: HTMLElement) {
  const pane = new Pane({
    container: el,
  });
  const [ctx, device, format] = await initWGPUCanvas(el, true);
  const module = device.createShaderModule({
    label: "hardcoded rgb triangle shader",
    code: texturesCode,
  });
  const texture = device.createTexture({
    size: textureDimensions,
    format: "rgba8unorm",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });
  device.queue.writeTexture(
    { texture },
    textureData,
    { bytesPerRow: textureDimensions[0] * 4 },
    { width: textureDimensions[0], height: textureDimensions[1] },
  );
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
  const bindGroups: GPUBindGroup[] = [];
  for (let i = 0; i < 8; i++) {
    const sampler = device.createSampler({
      addressModeU: i & 1 ? "repeat" : "clamp-to-edge",
      addressModeV: i & 2 ? "repeat" : "clamp-to-edge",
      magFilter: i & 4 ? "linear" : "nearest",
    });
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: sampler },
        { binding: 1, resource: texture.createView() },
      ],
    });
    bindGroups.push(bindGroup);
  }
  const settings = {
    addressModeU: "repeat",
    addressModeV: "repeat",
    magFilter: "linear",
  };
  pane.addBinding(settings, "addressModeU", {
    options: { repeat: "repeat", "clamp-to-edge": "clamp-to-edge" },
  });
  pane.addBinding(settings, "addressModeV", {
    options: { repeat: "repeat", "clamp-to-edge": "clamp-to-edge" },
  });
  pane.addBinding(settings, "magFilter", {
    options: { nearest: "nearest", linear: "linear" },
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
    const ndx =
      (settings.addressModeU === "repeat" ? 1 : 0) +
      (settings.addressModeV === "repeat" ? 2 : 0) +
      (settings.magFilter === "linear" ? 4 : 0);
    const bindGroup = bindGroups[ndx];
    const renderPassDescriptor = triangleRenderPassDescriptor(
      ctx.getCurrentTexture().createView(),
    );
    const encoder = device.createCommandEncoder({ label: "our encoder " });
    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(6); // call our vertex shader 6 times
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
    debug(ctx);
  }

  resizeCanvas(ctx.canvas as HTMLCanvasElement, device, render);
  pane.on("change", () => render());
  return () => pane.dispose();
}

export const texturesScene: Scene = {
  title: "Textures",
  description: `Introducing textures (see <a href="https://webgpufundamentals.org/webgpu/lessons/webgpu-textures.html" target="_blank" rel="noopener noreferrer">Textures @ webgpufundamentals.com</a>)`,
  func: textures,
};
