# Notes on packages & crates

Crates are the smallest amount of code that the Rust compiler considers at a time.

A package is abundle of one more crates. Packages can have multiple binary crates and/or a single library crate. Packages cannot have multiple libs. Lib crates are similar to bin crates however, they do not have a main function.

The crate root is the the source file that the Rust compiler starts from in a package. This can be:
src/main.rs (bin crate root)
src/lib.rs (lib crate root)

rustc is in the dark re. the project structure - cargo knows about that and passes its understanding to rustc calls.

### Modules
- Declared with `mod my_module;` or `mod my_module { // contents }`
- Module resolution with `mod` keyword via `src/my_module.rs` or `src/my_module.rs`
- Submodules can be declared within these files, and resolved within subdirs within that dir.
- `Bzz` referenced via `crate::my_module::my_submodule::Bzz`
- `pub mod` = make a module public, `pub <declaration>` make an item within a public module public.

### Libraries
Created with cargo new restaurant --lib
