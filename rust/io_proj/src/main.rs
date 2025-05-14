// https://doc.rust-lang.org/stable/book/ch12-00-an-io-project.html
// building a simplified grep clone
// Usage: cargo run -- searchstring test/file.txt
use io_proj::{Config, run};
use std::{env, process};

fn main() {
    // let args: Vec<String> = env::args().collect();
    let config = Config::build(env::args()).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {err}");
        process::exit(1)
    });
    if let Err(e) = run(config) {
        eprintln!("Application error: {e}");
        process::exit(1);
    }
}
