// Unsafe Rust (opt out of safety guarantees)
// Advanced Traits (associated types, default type params, fully qualified syntax, supertraits)
// Advanced Types (newtype pattern, type aliases, never, dynamically sized types)
// Advanced Functions (function pointers & returning closures)
// Macros (compile time definitions)
//
// Unsafe code abilities:
// Derference a raw pointer
// Call an unsafe function or method
// Access or modify a mutable static variable
// Implement an unsafe trait
// Access fields of a union

use std::slice;

fn _unsafe_examples() {
    let mut num = 5;
    let r1 = &raw const num;
    let r2 = &raw mut num;
    let address = 0x012345usize;
    let r = address as *const i32;
    unsafe {
        println!("{}", *r1);
        // println!("{}", *r); // segfault due to access of arbitrary mem address
    }
}

fn _split_example() {
    let mut v = vec![1, 2, 3, 4, 5, 6];

    let r = &mut v[..];

    let (a, b) = r.split_at_mut(3);

    assert_eq!(a, &mut [1, 2, 3]);
    assert_eq!(b, &mut [4, 5, 6]);
}

fn split_at_mut(values: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = values.len();
    let ptr = values.as_mut_ptr();

    assert!(mid <= len);

    unsafe {
        (
            slice::from_raw_parts_mut(ptr, mid),
            slice::from_raw_parts_mut(ptr.add(mid), len - mid),
        )
    }
}

fn split_at_mut_unsafe_ex() {
    let mut v = vec![1, 2, 3, 4, 5, 6];
    let r = &mut v[..];
    let (a, b) = split_at_mut(r, 3);
    a[0] = 2;
    assert_eq!(a, &mut [2, 2, 3]);
    assert_eq!(b, &mut [4, 5, 6]);
    assert_eq!(r[0], 2);
    assert_eq!(v[0], 2);
    assert_eq!(v[2], 3);
}

fn main() {
    // unsafe_examples();
    split_at_mut_unsafe_ex();
}
