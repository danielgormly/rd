// https://doc.rust-lang.org/stable/book/ch12-00-an-io-project.html
// building a simplified grep clone
// Usage: cargo run -- searchstring test/file.txt
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    // args[1] is the binary
    let query = &args[1];
    let file_path = &args[2];
    println!("Searching for '{query}' in '{file_path}'");
}
