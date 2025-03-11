# Inter-stage variables

In example 02 & 03 we define an "inter-stage variable". An inter-stage variable is an output from a vertex shader that is interpolated when passed to a fragment shader.

## Notes on @builtin(position)

Vertex shaders do not determine the final pixel colour which in most cases, is what a rendering pipeline provides, however they do provide transformed vertex positions, as denoted by the @builtin(position).

Within a fragment shader, the @builtin(position) has a separate meaning. It denotes a center coordinate for a pixel, as opposed to a pixel coordinate (top left edge coordinate). It is an input the fragment shader receives to compute a colour or value for.

## Interpolation settings

type:
- perspective (default)
- linear: doesn't respect perspective correctness
- falt: not interpolated

sampling:
- center: performed at pixel center (default)
- centroid: performed at a point that lies within all the samples covered by the fragment within the current primitive
- sample: performed per sample (fragment shader is invoked once per sample when this attribute is applied... slightly confused!)
- first (type flat only): first vertex of the primitive being drawn
- either (type flat only): first or last vertex of the primitive being drawn

Example:
```wgsl
@location(2) @interpolate(linear, center) myVariableFoo: vec4f;
@location(3) @interpolate(flat) myVariableBar: vec4f;
```
