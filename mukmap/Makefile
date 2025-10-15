# Platform-specific compiler and libraries
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
    CC = clang
    CFLAGS = -Wall -Wextra -O2 -I. `sdl2-config --cflags`
    LDFLAGS = `sdl2-config --libs`
    LIBS = -lcglm -framework OpenGL
else
    CC = gcc
    CFLAGS = -Wall -Wextra -O2 -I. `pkg-config --cflags sdl2`
    LDFLAGS = `pkg-config --libs sdl2`
    LIBS = -lcglm -lGLESv2 -lm
endif

# Debug build (no optimization, with debug symbols)
debug: CFLAGS += -g -O0 -DDEBUG
debug: mukmap

# Release build (optimized)
release: CFLAGS += -O2 -DNDEBUG
release: mukmap

mukmap: main.c
	$(CC) $(CFLAGS) main.c vendor/ini.c -o mukmap $(LDFLAGS) $(LIBS)

clean:
	rm -rf mukmap mukmap.dSYM

.PHONY: clean debug release
