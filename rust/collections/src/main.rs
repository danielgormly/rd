// vectors (numeros variables de valores se almanacen juntos)
fn vectors() {
    // Creating a vector:
    let v: Vec<i32> = Vec::new();
    println!("{:?}", v);
    let v = vec![1, 2, 3]; // Macro que infere el tipo desde la data proveído
    println!("{:?}", v);

    // updating a vector:
    let mut nv = Vec::new();
    nv.push(5);
    nv.push(6);
    nv.push(7);
    nv.push(8);
    println!("{:?}", nv);

    let zero = nv.get(0);
    if let Some(val) = zero {
        println!("zero de nv: {}", val);
    }

    let five = nv.get(5);
    if let Some(val) = five {
        println!("five of nv: {}", val); // Este codigo no funcionará
    } else {
        println!(
            "el quinto elemente no existe, así se ve el valor: {:?}",
            five
        );
    }

    // let bad_ref = &nv[5]; // Resultará en un pánico

    let second = nv[1]; // copies
    nv[1] = 2; // if nv[1] was accessed as a ref, this would fail, as it would be an immutable and mutable reference together
    println!("{:?}", second);

    let mut idx = 0;
    for i in &mut nv {
        *i += 5; // deref'd to modify
        println!("print {idx} index updated (+5) val of nv: {}", i);
        idx += 1;
    }
}

// strings (colleción de cáracters)
// str = is the string slice, core string type of rust
// generally borrowed i.e. &str
// "string literals are stored in the binary"
// the String type (from the std library) is a growable, mutable, owned, UTF-8 encoded string type
// String type is a wrapper around a Vec<T>
fn strings() {
    let mut s = String::new(); // We don't actually need to create the new type here
    s = "hellow".to_string(); // as this ends up creating a String type
    let sp = String::from("hello"); // another way to go
    s.push_str(" world");
    print!("{s}");

    let s1 = String::from("Hello");
    let s2 = String::from("World");
    let s3 = s1 + &s2;
    println!("\n{s3}")
    // So here, our + is really a String.add() which consumes (moves) s1, with s2 it copies the bytes
    // and then it creates a new String combined with both of them
    // Rust strings do not support indexing!!!
}

// hash maps (kv)
use std::collections::HashMap;

fn hash_maps() {
    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);
    scores.entry(String::from("Red")).or_insert(25);

    let team_name = String::from("Blue");
    let score = scores.get(&team_name).copied().unwrap_or(0);
    println!("{} score is {} (retrieved individually)", team_name, score);
    for (key, value) in &scores {
        println!("{} score is {}", key, value);
    }
}

fn main() {
    vectors();
    strings();
    hash_maps();
}
