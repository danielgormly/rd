// cons list (construction function list)
// https://doc.rust-lang.org/stable/book/ch15-01-box.html
// (1, (2, (3, Nil)))
// The second item of each pair, becomes a new item pair
// thus the top level item only has two items,
// and as we traverse the second item, we only encounter 2 items max, or 1 for the final item
// the first item is always a val, the second item is always a (val, Nil|List)

enum List {
    Cons(i32, Box<List>),
    Nil,
}

use crate::List::{Cons, Nil};

fn cons_list() {
    let list = Cons(7, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));
    // println!("{}", list[0]);
    if let Cons(first_value, _) = list {
        println!("First value: {}", first_value);
    }
}

fn main() {
    let b = Box::new(5); // heap stored val, dereferenced as normal
    println!("b = {b}");
    cons_list();
}
