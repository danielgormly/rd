// Patterns and Matching

fn complicated_conditional() {
    let favorite_colour: Option<&str> = None;
    let is_tuesday = false;
    let age: Result<u8, _> = "34".parse();

    if let Some(colour) = favorite_colour {
        println!("Using your favourite colour, {colour}, as the background");
    } else if is_tuesday {
        println!("Tuesday is green day!");
    } else if let Ok(age) = age {
        if age > 30 {
            // something
            println!("complicated conditional over 30")
        } else {
            // something else
            println!("complicated conditional 30 or under")
        }
    } else {
        println!("complicated conditional else all")
    }
}

fn while_loop() {
    let (tx, rx) = std::sync::mpsc::channel();
    std::thread::spawn(move || {
        for val in [1, 2, 3] {
            tx.send(val).unwrap();
        }
    });

    while let Ok(value) = rx.recv() {
        println!("{value}");
    }
}

fn main() {
    while_loop();
}
