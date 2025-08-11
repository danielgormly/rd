# Revisiting the Rust Book

```bash
# Syntactic macro expansion
cargo install cargo-expand
cargo expand

# Shows human readable assembly output
rustc --emit=asm src/main.rs
# Shows Mid-level Intermediate Representation output
rustc --emit=mir src/main.rs
```
