# Hello World Exploration

Following [Hello World](https://thecoder08.github.io/hello-world.html) blogpost

Compile main.c to binary/executable/machine code
`gcc main.c -o hello`

Creates a hello file 16KB

Running `file hello`
> `hello: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 4.4.0, BuildID[sha1]=07436fb4640b98c9866a3d4d0106af82911a7189, not stripped`

Breaking it down:
- ELF (Executable and Linkable Format) 64-bit LSB pie executable - replaces older "a.out format"
- 64-bit: Compiled for 64-bit architecture i.e. can use 64-bit memory addresses (e.g. in ram)/registers (e.g. in cpus)
- LSB: Least Significant Bit - little-endian byte ordering = least significant bit stored first
- pie executable - position independent executable - can be loaded at any mem address, security feature as part of ASLR (random address space layout)
- x86-64: instruction architecture (intel/amd 64-bit) - note x86-64 can run 32-bit programs too
- version 1 (SYSV) - ELF version 1
- dynamically linked - uses shared libraries loaded at runtime
- interpreter /lib64/ld-linux-x86-64.so.2 - dynamic linker/loader that will load the program, responsible for loading shared libs at runtime
- for GUN/Linux 4.4.0 - minimum version this was compiled for
- BuiltID[sha1] - unique identifier for this build - debugging and matching debug info
- not stripped - still contains debugging symbols

Deeper into the ELF with `readelf -h hello`:
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              DYN (Position-Independent Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x1040
  Start of program headers:          64 (bytes into file)
  Start of section headers:          13496 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         13
  Size of section headers:           64 (bytes)
  Number of section headers:         30
  Section header string table index: 29
