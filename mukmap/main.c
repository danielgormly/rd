#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <SDL.h>
#include "vendor/ini.h"
// #include <SDL2/SDL.h> // didn't work, but maybe required on Linux

// Mac: OpenGL 3.2+ Core Profile (desktop)
// GameShell: OpenGL ES 2.0 (embedded/mobile)
#ifdef __APPLE__
    #define GL_SILENCE_DEPRECATION
    #include <OpenGL/gl3.h>
#else
    #include <GLES2/gl2.h>
#endif

// #include <cglm/cglm.h> later

#define STB_DS_IMPLEMENTATION
#include "stb_ds.h"

// for reading shaders
char* read_file(const char* path)
{
    FILE* f = fopen(path, "rb");
    if (!f) {
        fprintf(stderr, "Failed to open %s\n", path);
        return NULL;
    }

    fseek(f, 0, SEEK_END);
    long size = ftell(f);
    fseek(f, 0, SEEK_SET);

    char* content = malloc(size + 1);
    fread(content, 1, size, f);
    content[size] = '\0';
    fclose(f);

    return content;
}

// Helper: Compile shader
GLuint compile_shader(GLenum type, const char* source)
{
    GLuint shader = glCreateShader(type);
    glShaderSource(shader, 1, &source, NULL);
    glCompileShader(shader);

    // Check for errors
    GLint success;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
    if (!success) {
        char log[512];
        glGetShaderInfoLog(shader, 512, NULL, log);
        fprintf(stderr, "Shader compilation failed:\n%s\n", log);
        return 0;
    }

    return shader;
}

// Helper: Create shader program
GLuint create_program(const char* vert_path, const char* frag_path)
{
    char* vert_source = read_file(vert_path);
    char* frag_source = read_file(frag_path);

    if (!vert_source || !frag_source) {
        return 0;
    }

    GLuint vert_shader = compile_shader(GL_VERTEX_SHADER, vert_source);
    GLuint frag_shader = compile_shader(GL_FRAGMENT_SHADER, frag_source);

    free(vert_source);
    free(frag_source);

    if (!vert_shader || !frag_shader) {
        return 0;
    }

    GLuint program = glCreateProgram();
    glAttachShader(program, vert_shader);
    glAttachShader(program, frag_shader);
    glLinkProgram(program);

    // Check for errors
    GLint success;
    glGetProgramiv(program, GL_LINK_STATUS, &success);
    if (!success) {
        char log[512];
        glGetProgramInfoLog(program, 512, NULL, log);
        fprintf(stderr, "Program linking failed:\n%s\n", log);
        return 0;
    }

    glDeleteShader(vert_shader);
    glDeleteShader(frag_shader);

    return program;
}

typedef struct
{
    int version;
    int width;
    int height;
} config_type;


static int handler(void* config, const char* section, const char* name, const char* value)
{
    config_type* pconfig = (config_type*)config;

    #define MATCH(s, n) strcmp(section, s) == 0 && strcmp(name, n) == 0
    if (MATCH("", "width")) {
        pconfig->width = atoi(value);
    } else if (MATCH("", "height")) {
        pconfig->height = atoi(value);
    } else {
        return 1; // Skip unknown
    }
    return 1;
}

int main(int argc, char* argv[])
{
    (void)argc;  // Unused
    (void)argv;  // Unused

    // parse ini
    const char* raw_config = "version=0\n\
width=960\n\
height=720\n";

    config_type config = {
        .version = 0,
        .width = 320,
        .height = 240
    };

    if (ini_parse_string(raw_config, handler, &config) < 0) {
        printf("Failed to load config");
        return 1;
    };
    printf("config loaded from 'test.ini': version=%d, width=%d, height=%d", config.version, config.width, config.height);

    // Init SDL
    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        fprintf(stderr, "SDL_Init failed: %s\n", SDL_GetError());
        return 1;
    }

    // OpenGL version
    #ifdef __APPLE__
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 3);
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 2);
    #else
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_ES);
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
        SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
    #endif

    SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
    SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);

    SDL_Window* window = SDL_CreateWindow(
        "mukmap",
        SDL_WINDOWPOS_CENTERED,
        SDL_WINDOWPOS_CENTERED,
        config.width, config.height,
        SDL_WINDOW_OPENGL | SDL_WINDOW_SHOWN
    );

    if (!window) {
        fprintf(stderr, "Window creation failed: %s\n", SDL_GetError());
        return 1;
    }

    SDL_GLContext gl_context = SDL_GL_CreateContext(window);
    if (!gl_context) {
        fprintf(stderr, "OpenGL context creation failed: %s\n", SDL_GetError());
        return 1;
    }

    SDL_GL_SetSwapInterval(1);  // VSync

    printf("OpenGL Version: %s\n", glGetString(GL_VERSION));
    printf("GLSL Version: %s\n", glGetString(GL_SHADING_LANGUAGE_VERSION));

    // Create shader program (use platform-specific shaders)
    #ifdef __APPLE__
        GLuint program = create_program("vertex_mac.glsl", "fragment_mac.glsl");
    #else
        GLuint program = create_program("vertex.glsl", "fragment.glsl");
    #endif

    if (!program) {
        fprintf(stderr, "Failed to create shader program\n");
        return 1;
    }

    // Triangle vertices (position + color)
    float vertices[] = {
        // x,    y,    z,     r,    g,    b
         0.0f,  0.5f, 0.0f,  1.0f, 0.0f, 0.0f,  // Top (red)
        -0.5f, -0.5f, 0.0f,  0.0f, 1.0f, 0.0f,  // Bottom-left (green)
         0.5f, -0.5f, 0.0f,  0.0f, 0.0f, 1.0f,  // Bottom-right (blue)
    };

    // Create Vertex Buffer Object (VBO)
    GLuint vbo;
    glGenBuffers(1, &vbo);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    // Get attribute locations
    GLint pos_attrib = glGetAttribLocation(program, "position");
    GLint col_attrib = glGetAttribLocation(program, "color");

    // Position attribute (3 floats, stride 6 floats, offset 0)
    glEnableVertexAttribArray(pos_attrib);
    glVertexAttribPointer(pos_attrib, 3, GL_FLOAT, GL_FALSE,
                          6 * sizeof(float), (void*)0);

    // Color attribute (3 floats, stride 6 floats, offset 3)
    glEnableVertexAttribArray(col_attrib);
    glVertexAttribPointer(col_attrib, 3, GL_FLOAT, GL_FALSE,
                          6 * sizeof(float), (void*)(3 * sizeof(float)));

    // Main loop
    bool running = true;
    SDL_Event event;
    Uint32 last_time = SDL_GetTicks();
    int frame_count = 0;

    while (running) {
        // Handle events
        while (SDL_PollEvent(&event)) {
            if (event.type == SDL_QUIT) {
                running = false;
            }
            if (event.type == SDL_KEYDOWN) {
                if (event.key.keysym.sym == SDLK_ESCAPE) {
                    running = false;
                }
            }
        }

        // Clear screen
        glClearColor(0.1f, 0.1f, 0.15f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        // Draw triangle
        glUseProgram(program);
        glDrawArrays(GL_TRIANGLES, 0, 3);

        // Swap buffers
        SDL_GL_SwapWindow(window);

        // FPS counter
        frame_count++;
        Uint32 current_time = SDL_GetTicks();
        if (current_time - last_time >= 1000) {
            printf("FPS: %d\n", frame_count);
            frame_count = 0;
            last_time = current_time;
        }
    }

    // Cleanup
    glDeleteBuffers(1, &vbo);
    glDeleteProgram(program);

    SDL_GL_DeleteContext(gl_context);
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}
