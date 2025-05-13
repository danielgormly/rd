// https://doc.rust-lang.org/stable/book/ch12-00-an-io-project.html
// building a simplified grep clone
// Usage: cargo run -- searchstring test/file.txt
use std::{env, fs};

fn main() {
    let args: Vec<String> = env::args().collect();
    // args[1] is the binary
    let query = &args[1];
    let file_path = &args[2];
    println!("Searching for '{query}' in '{file_path}'");

    let contents = fs::read_to_string(file_path).expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}
