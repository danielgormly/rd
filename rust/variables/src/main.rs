fn main() {
    // Lang features

    let mut x = 5;
    println!("The value of x is {x}");
    x = 6;
    println!(
        "The value of x is now {x}, this is possible because x is explicityl declared a mutable val with the mut keyword"
    );
    const TWO_HOURS_IN_SECONDS: u32 = 2 * 60 * 60;
    println!(
        "the value of 2 hours in seconds, determined by factors 2, 60, 60 at compile time is {TWO_HOURS_IN_SECONDS}"
    );

    let y = 5;
    let y = y + 5;
    println!("y was originally 5, now shadowed as original y + 5, so y={y}");
    {
        let y = y * 5;
        println!("shadowed again in an inner scope as {y}");
    }

    println!("but in our parent scope, y is still {y} as before");

    let tuppie: (i32, f32, f64) = (4, 4.0, 4.0);

    println!(
        "My tuple's values are {}, {}, {}",
        tuppie.0, tuppie.1, tuppie.2
    );

    let arrieta: [f32; 2] = [2.0, 4.0];
    println!(
        "my array has {} vals of {} and {}",
        arrieta.len(),
        arrieta[0],
        arrieta[1]
    );

    // Ownership
    let s = "hi";
    let r = &(s.to_owned() + "yo");
    let mut g = String::from("bo");
    g.push_str("boo");
    println!("hi {r} {g}");

    let mut z = woah(g.clone());
    let c = &z; // we can hold multiple immutable refs
    by_ref(c);
    let dz = &mut z; // but if any of those are mutable, we can only ref to one, we can add this here bc we no longer use the immutable refs
    mut_ref(dz);

    // Slices
    let b = first_word(dz);
    println!("index of first space in '{dz}': {b}");
    let slice = &dz[0..b];
    println!("the first word is '{}'", slice);
    println!("the rest of the word is '{}'", &dz[b + 1..]);

    let a = [1, 2, 3, 4, 5];

    let slice = &a[1..1 + 3];

    for (i, &string) in slice.iter().enumerate() {
        println!("{i}# {string}")
    }
}

fn woah(some_string: String) -> String {
    println!("woah: {}", some_string);
    some_string
}

fn by_ref(some_string: &String) {
    // borrows some_string
    println!("by_ref: {}", some_string);
}

fn mut_ref(some_string: &mut String) {
    // borrows a mutuable ref
    some_string.push_str(" lol");
    println!("mut_ref: {}", some_string);
}

fn first_word(s: &String) -> usize {
    let bytes = s.as_bytes();
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return i;
        }
    }
    s.len()
}
