# Notes on packages & crates

Crates are the smallest amount of code that the Rust compiler considers at a time.

A package is abundle of one more crates. Packages can have multiple binary crates and/or a single library crate. Packages cannot have multiple libs. Lib crates are similar to bin crates however, they do not have a main function.

The crate root is the the source file that the Rust compiler starts from in a package. This can be:
src/main.rs (bin crate root)
src/lib.rs (lib crate root)

rustc is in the dark re. the project structure - cargo knows about that and passes its understanding to rustc calls.
