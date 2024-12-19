## 00 Fundamentals

WebGL is a rasterisation engine that draws points, lines & triangles. Anything else it does (e.g. 3D) is up to us.

The GPU code is run with a strict language like GLSL & comprises 2 functions: a vertex shader and a fragment shader.

Vertex shader computes vertex positions, and fragment shaders is used during rasterisation to compute pixel colour.

Most of the WebGL API is about settuping up state for these function pairs.

Setup state -> gl.drawArrays + gl.drawElements (both functions need to be provided data)

## Shaders receive data via

1. Attributes, Buffers & Vertex Arrays
Arrays of arbitrary binary data uploaded to the GPU (usually positions, normals, texture-coordinates, vertex colors etc).

Attributes specify how (data type, offset, count etc) to pull data out of buffers & provde them to your vertext shader. E.g. you might put positions in a buffer as 3x32bit floats.

Buffers are not random access, a vertext shader will be run a specified count & pull from each value.

The state of attributes is collected into a vertex array object (VAO).

2. Uniforms: Global variables set before shader execution.

3. Textures: Arrays of data you can randomly access in your shader program e.g. image data, but you can put anything in there.

4. Varyings
A means to pass vertex shader data to a fragment shader.

WebGL cares about 2 things: Clip space coordinates and colors. This is what to provide WebGL with those 2 shaders.

Clip space coodrinates go from -1 to +1.
