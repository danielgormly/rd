CC = clang
CFLAGS = -Wall -Wextra -O2 -I. `sdl2-config --cflags`
LDFLAGS = `sdl2-config --libs`
LIBS = -lcglm -framework OpenGL

# Debug build (no optimization, with debug symbols)
debug: CFLAGS += -g -O0 -DDEBUG
debug: mukmap

# Release build (optimized)
release: CFLAGS += -O2 -DNDEBUG
release: mukmap

mukmap: main.c
	$(CC) $(CFLAGS) main.c -o mukmap $(LDFLAGS) $(LIBS)

clean:
	rm -rf mukmap mukmap.dSYM

.PHONY: clean debug release
