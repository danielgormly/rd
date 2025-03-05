# 00-webgpu-fundamentals

https://webgpufundamentals.org/

WebGPU is an API with 2 purposes:
1. Draw triangles/points/lines to textures
2. Run computations on the GPU

Everything else is up to me.

For an idea of how much code is involved in getting something onto the screen: ThreeJS minified is ~600k, Tensorflow with WebGPU backend is ~500k.

## My naive model before I've read the guide
At this point, my understanding of a shader running on the GPU is that it can run linear algebra and other logical functions on a large matrices in parallel (or even separately asynchronously), bringing in large amounts of data with enourmous bandwidth from onboard memory. It does a few things at a time and you can feed it new data or state. More specifically, you can send the GPU multiple pipelines (groups of shaders to be run in succession each frame) & build frames from the results - to be flushed directly to a display. Now we  can see how much of a fucking dummy I am later on.

## Shader types
- Vertex Shaders: Computes vertices; returns vertex positions, returning every 3 positions and draws triangles between the outputs.
- Fragment Shader: Computes colors; for each drawn triangle; a pixel needs to be coloured.
- Compute Shader: More generic - do this n times & pass it to the next thing to do something else (kinda looks like NN right)

Author suggests analogy between array.forEach or array.map, or yeah, it runs a function on a set of data (however in this case, at least partially in parallel). It mentions that where it differs is that you have to copy everything onto the GPU in the form of buffers and textures (huh what's the difference).

## High level WebGPU setup to draw triangles

A render pass consists of a set of rendering operations, you set the pipeline within a render pass encoder. The render defines where rendering output goes.

- pipeline: contains vertex shader and fragment shader (and potentially computer shader). The shaders reference resources (buffers, textures, samplers, indirectly through Bind Groups). Also defines attributes that reference buffers indirectly through the internal state. Attributes thus pull data out of buffers & feed them into the vertex shader. The vertex shader may feed data into the fragment shader. The fragment shader writes to textures indirectly through the render pass description. Contains rasterization and blend states. Vertex input layouts (how vertex data is interpreted is container here)
- viewport
- scissor
- n vertex buffers (references buffers)
- index buffer
- n bindgroups (references textures, storage buffer, uniform buffer, sampler)
- optionally too, a depthstencilattachment
- Render pass has color attachments where color data is written to - typically referencing a texture view

You cannot change most WebGPU resources once set, you can change their contents but not size, usage, format etc.

Some state is setup via CommandBuffers - i.e. buffers of commands. The encoder encodes commands into the command buffer. You then finish the encoder and it gives you the command buffer it created.
