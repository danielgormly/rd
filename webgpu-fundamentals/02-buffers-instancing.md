# Buffers & instancing
Buffers are created and bound to a group (as a member of its user defined type typically) and referenced within a shader. You can pass data to it and update its data later. They are like global variables for your shaders - they can work across both shaders. There are a few main types of buffers

## Uniform Buffers
- By default, small, a maxmimum size of 64KiB / 65536 bytes
- Can be faster for their typical use case (materials, orientations etc)
- Read-only

## Storage Buffers
- By default, large, a maxmimum size of 128MiB / 134 217 728 bytes
- Can be written to within shader code

## Instancing
