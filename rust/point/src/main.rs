// cons list (construction function list)
// https://doc.rust-lang.org/stable/book/ch15-01-box.html
// (1, (2, (3, Nil)))
// The second item of each pair, becomes a new item pair
// thus the top level item only has two items,
// and as we traverse the second item, we only encounter 2 items max, or 1 for the final item
// the first item is always a val, the second item is always a (val, Nil|List)

use std::ops::Deref;

pub mod ConsList {
    enum List {
        Cons(i32, Box<List>),
        Nil,
    }
    use self::List::{Cons, Nil};
    pub fn cons_list() {
        let list = Cons(7, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));
        // println!("{}", list[0]);
        if let Cons(first_value, _) = list {
            println!("First value: {}", first_value);
        }
    }
}

fn ref_example() {
    let x = 5;
    let y = &x;
    assert_eq!(5, x);
    assert_eq!(5, *y);
    // assert_eq!(5, y); // no can do bc types don't align
}

fn box_example() {
    let x = 5;
    let y = Box::new(x); // copies value into box-stored mem
    assert_eq!(5, x);
    assert_eq!(5, *y); // works the same
}

struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

impl<T> Deref for MyBox<T> {
    type Target = T; // associated type for the Derf trait to use (covered in ch 20)
    fn deref(&self) -> &Self::Target {
        &self.0 // first value in tuple struct
    }
}

fn smart_pointer() {
    let x = 5;
    let y = MyBox::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y);
}

fn dref_coersion(name: &str) {
    println!("Hello, {name}!");
}

fn main() {
    let b = Box::new(5); // heap stored val, dereferenced as normal
    println!("b = {b}");
    ConsList::cons_list();
    ref_example();
    box_example();
    smart_pointer();
    let m = MyBox::new(String::from("Rust"));
    dref_coersion(&m); // dereference operator uses custom Deref implementation
    dref_coersion(&(*m)[..]); // explicit dereference!
}
