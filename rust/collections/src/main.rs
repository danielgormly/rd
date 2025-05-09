// vectors (numeros variables de valores se almanacen juntos)
// strings (colleción de cáracters)
// hash maps (kv)

fn main() {
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
