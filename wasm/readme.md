# WASM week

WebAssembly is a binary instruction format for a stack-based virtual machine. It's a vm coz it defines an abstract bytecode instruction set that can be translated efficiently to other CPUs, and its access to the underlying machine and memory is bounded. Stack-based because it doesn't define registers simplifying the instruction set. It can be deployed for servers or front-ends.

So I guess the key is that it's a universal (portable), efficient, and security-bounded compilation target for high speed computation. I can see a parallel to WebGL/WebGPU (or other shader abstractions) here.

.wasm = bytecode
.wat = web assembly text format - human readable version (check it without a hex editor)

## Resources
https://webassembly.org/
https://github.com/EmNudge/watling
https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Rust_to_Wasm#rust_and_webassembly_use_cases
