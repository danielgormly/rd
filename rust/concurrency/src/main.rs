use std::{thread, time::Duration};

fn interleave() {
    thread::spawn(|| {
        for i in 1..3 {
            println!("Hi number {i} from the spawned thread!");
            thread::sleep(Duration::from_nanos(1));
        }
    });

    // handle.join().unwrap(); // call immediately

    for i in 1..4 {
        println!("hi number {i} from the main thread!");
        thread::sleep(Duration::from_nanos(1));
    }
}

fn main() {
    interleave();
    let v = vec![1, 2, 3];
    let handle = thread::spawn(move || {
        println!("here's a vector: {v:?}");
        thread::sleep(Duration::from_millis(1));
    });
    handle.join().unwrap();
}
