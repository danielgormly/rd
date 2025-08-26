pub trait HelloMacro {
    fn hello_macro();
}

use macroman::HelloMacro;

#[derive(HelloMacro)]
struct Pancakes;

// impl HelloMacro for Pancakes {
//     fn hello_macro() {
//         println!("Hello, Macro! My name is Pancaks!");
//     }
// }

fn main() {
    Pancakes::hello_macro();
}
