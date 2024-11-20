# Compiler settings
CC = gcc
# -Wall -Wextra (enabled warnings)
# -02 enables optimizations
CFLAGS = -Wall -Wextra -O2 -arch arm64
TARGET = parser
SRC = main.c

# Build rule
all: $(TARGET)

# Linking
$(TARGET): $(SRC)
	$(CC) $(CFLAGS) $(SRC) -o $(TARGET)

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(TARGET)

.PHONY: all clean
