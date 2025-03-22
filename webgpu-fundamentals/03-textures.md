# Textures

https://webgpufundamentals.org/webgpu/lessons/webgpu-textures.html

Textures can access "sampler" hardware which can read up to 16px at once to do convolutions on.

The WGSL functions take
- a texture which represents the data
- a sampler specifying how data is pulled from texture
- a texture coordinate which specifies from where we take values from texture

0.0 -------> 1.0
 |
 |
 |
 |
1.0

Texture coordinate origin extend south & east from north-west.

Instead of XY, we use UV in texture space, because XY has been taken.
