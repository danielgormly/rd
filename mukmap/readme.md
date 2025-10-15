# mukmap

Exploration of SDL2, OpenGL ES 2.0 & C to build fast maps for low performance devices.

```bash
# Install primary dependencies
# cglm = optimised graphics maths (https://github.com/recp/cglm)
brew install sdl2 cglm
# Public domain data structures
curl -LO https://raw.githubusercontent.com/nothings/stb/refs/heads/master/stb_ds.h
```

## Mac specific concerns
We are using OpenGL 3.2 Core with GLSL 1.50 shadres + VAO (Vertex Object Arrays)

## Linux specific concerns
We are using OpenGL ES 2.0 with GSLS ES 1.00 shaders, I want to target my Clockwork Gameshell
