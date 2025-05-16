use std::cell::RefCell;
use std::rc::Rc;

// We use Box to stuff on the Heap
// ensuring data redirection and not storing values unknown at compile time
// In lists, we may want referenced values in multiple places (like live clones)
// Normally,
//
// This is so we don't lose track of structures in memory & avoid garbage collection
// Interior mutability: mutate data despite immutable references to that data, at runtime, circumventing the compiler
// Rc<T>: ReferenceCounted Smart Pointer: allows us to hold multiple owners of same immmutable value
// RefCell allows us to have multiple owners of a value you can mutate
//
// So Rc<RefCell<i32>>
// is saying that you can hold multiple immutable references to a RefCell that you CAN mutate.
// So you can hold multiple

#[derive(Debug)]
enum List {
    Cons(i32, RefCell<Rc<List>>),
    Nil,
}

use crate::List::{Cons, Nil};

impl List {
    fn tail(&self) -> Option<&RefCell<Rc<List>>> {
        match self {
            Cons(_, item) => Some(item),
            Nil => None,
        }
    }
}

fn main() {}
