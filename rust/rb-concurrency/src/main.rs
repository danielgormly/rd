use std::{
    rc::Rc,
    sync::{Arc, Mutex, mpsc},
    thread,
    time::Duration,
};

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

fn moving_data() {
    let v = vec![1, 2, 3];
    let handle = thread::spawn(move || {
        println!("here's a vector: {v:?}");
        thread::sleep(Duration::from_millis(1));
    });
    handle.join().unwrap();
}

// fn channels() {
//     let (tx, rx) = mpsc::channel(); // multiple producer single consumer

//     let tx1 = tx.clone();
//     thread::spawn(move || {
//         let vals = vec![
//             String::from("hi"),
//             String::from("from"),
//             String::from("the"),
//             String::from("thread"),
//         ];
//         for val in vals {
//             tx.send(val).unwrap();
//             thread::sleep(Duration::from_millis(250));
//         }
//     });

//     thread::spawn(move || {
//         let vals = vec![
//             String::from("more"),
//             String::from("msgs"),
//             String::from("4"),
//             String::from("u"),
//         ];
//         for val in vals {
//             tx1.send(val).unwrap();
//             thread::sleep(Duration::from_millis(250));
//         }
//     });

//     for received in rx {
//         println!("Got: {received}");
//     }
// }

fn shared_state() {
    // Mutex = mutual exclusion (must acquire a lock)
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Results = {}", *counter.lock().unwrap());
}

fn main() {
    interleave();
    moving_data();
    // channels();
    shared_state();
}
