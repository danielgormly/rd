import { initWGPUCanvas } from "../canvas";

// Notes:
// A vertex shader
// Its argument vertex_index is a builtin, returning a 32-bit unsigned int
// returns a vec4f (object with 4x vecs) assigned to the "position" builtin
// Positions are returned in clipspace (-1<x<1, -1<y<1)
const hardcodedTriangle = `
@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32
) -> @builtin(position) vec4f {
  let pos = array(
    vec2f(0.0, 0.5), // top center
    vec2f(-0.5, -0.5), // bottom left
    vec2f(0.5, -0.5), // bottom right
  );
  return vec4f(pos[vertexIndex], 0.0, 1.0);
}

@fragment fn fs() -> @location(0) vec4f {
    return vec4f(1.0, 0.0, 0.0, 1.0);
}
`;

export async function triangle(el: HTMLElement) {
  const [ctx, device] = await initWGPUCanvas(el, true);
  device.createShaderModule({
    label: "hardcoded red triangle shader",
    code: hardcodedTriangle,
  });
}
