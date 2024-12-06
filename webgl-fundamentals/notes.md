## 00 Fundamentals

WebGL is a rasterisation engine that draws points, lines & triangles. Anything else it does (e.g. 3D) is up to us.

The GPU code is run with a strict language like GLSL & comprises 2 functions: a vertex shader and a fragment shader.

Vertex shader computes vertex positions, and fragment shaders is used during rasterisation to compute pixel colour.

Most of the WebGL API is about settuping up state for these function pairs.

Setup state -> gl.drawArrays + gl.drawElements (both functions need to be provided data)

## Shaders receive data via

1. Attributes, Buffers & Vertex Arrays


2. Uniforms

3. Textures

4. Varyings
