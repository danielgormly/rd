use std::{
    cell::RefCell,
    ops::DerefMut,
    pin::{Pin, pin},
    rc::Rc,
    time::Duration,
};

use trpl::{Either, Html, ReceiverStream, Stream, StreamExt};

async fn page_title(url: &str) -> (&str, Option<String>) {
    let response_text = trpl::get(url).await.text().await;
    let title = Html::parse(&response_text)
        .select_first("title")
        .map(|title| title.inner_html());
    (url, title)
}

// 17.01
fn async_race() {
    let args: Vec<String> = std::env::args().collect();

    trpl::run(async {
        let title_fut_1 = page_title(&args[1]);
        let title_fut_2 = page_title(&args[2]);

        let (url, maybe_title) = match trpl::race(title_fut_1, title_fut_2).await {
            Either::Left(left) => left,
            Either::Right(right) => right,
        };

        println!("{url} returnd first");

        match maybe_title {
            Some(title) => println!("Its page title is {title}"),
            None => println!("Its title could not be parsed"),
        }
    })
}

// 17.02
fn concurrency() {
    trpl::run(async {
        let handle = trpl::spawn_task(async {
            for i in 1..10 {
                println!("Hi number {i} from the first task!");
                trpl::sleep(Duration::from_millis(10)).await;
            }
        });

        for i in 1..5 {
            println!("hi number {i} from the second task!");
            trpl::sleep(Duration::from_millis(10)).await;
        }
        handle.await.unwrap();
    });
}

// 17.02
fn concurrency2() {
    trpl::run(async {
        let fut1 = async {
            for i in 1..10 {
                println!("Hi number {i} from the first task!");
                trpl::sleep(Duration::from_millis(10)).await;
            }
        };
        let fut2 = async {
            for i in 1..5 {
                println!("Hi number {i} from the second task!");
                trpl::sleep(Duration::from_millis(10)).await;
            }
        };
        trpl::join(fut1, fut2).await;
    })
}

// 17.02
fn concurrency3() {
    trpl::run(async {
        let (tx, mut rx) = trpl::channel();

        let tx1 = tx.clone();
        let tx1_fut = async move {
            let vals = vec![
                String::from("hi"),
                String::from("from"),
                String::from("the"),
                String::from("future"),
            ];

            for val in vals {
                tx1.send(val).unwrap();
                trpl::sleep(Duration::from_millis(500)).await;
            }
        };

        let rx_fut = async {
            while let Some(value) = rx.recv().await {
                println!("Got: {value}");
            }
        };

        let tx_fut = async move {
            let vals = vec![
                String::from("more"),
                String::from("messages"),
                String::from("from"),
                String::from("you"),
            ];

            for val in vals {
                tx.send(val).unwrap();
                trpl::sleep(Duration::from_millis(500)).await;
            }
        };

        trpl::join3(tx_fut, tx1_fut, rx_fut).await;
    });
}

// 17.03
fn concurrency4() {
    trpl::run(async {
        let (tx, mut rx) = trpl::channel();
        let tx1 = tx.clone();
        let tx1_fut = pin!(async move {
            let vals = vec![
                String::from("hi"),
                String::from("from"),
                String::from("the"),
                String::from("future"),
            ];

            for val in vals {
                tx1.send(val).unwrap();
                trpl::sleep(Duration::from_millis(500)).await;
            }
        });
        let tx_fut = pin!(async move {
            let vals = vec![
                String::from("more"),
                String::from("messages"),
                String::from("received"),
                String::from("over"),
            ];

            for val in vals {
                tx.send(val).unwrap();
                trpl::sleep(Duration::from_millis(500)).await;
            }
        });
        let rx_fut = pin!(async {
            while let Some(value) = rx.recv().await {
                println!("Got: {value}");
            }
        });
        let futures: Vec<Pin<&mut dyn Future<Output = ()>>> = vec![tx_fut, tx1_fut, rx_fut];
        trpl::join_all(futures).await;
        // println!("{a_result}, {b_result}, {c_result}");
    });
}

// 17.04
fn concurrency5() {
    trpl::run(async {
        let values = [1, 2, 3, 4, 5];
        let iter = values.iter().map(|n| n * 2);
        let stream = trpl::stream_from_iter(iter);
        let mut filtered = stream.filter(|value| value % 3 == 0 || value % 5 == 0);

        while let Some(value) = filtered.next().await {
            println!("The value was: {value}");
        }
    });
}

fn get_messages() -> impl Stream<Item = String> {
    let (tx, rx) = trpl::channel();

    trpl::spawn_task(async move {
        let messages = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

        for (index, message) in messages.into_iter().enumerate() {
            let time_to_sleep = if index % 2 == 0 { 100 } else { 300 };
            trpl::sleep(Duration::from_millis(time_to_sleep)).await;

            if let Err(send_error) = tx.send(format!("Message: '{message}'")) {
                eprintln!("Cannot send message '{message}': {send_error}");
                break;
            }
        }
    });

    ReceiverStream::new(rx)
}

fn get_intervals() -> impl Stream<Item = u32> {
    let (tx, rx) = trpl::channel();

    trpl::spawn_task(async move {
        let mut count = 0;
        loop {
            trpl::sleep(Duration::from_millis(1)).await;
            count += 1;
            tx.send(count).unwrap();
        }
    });

    ReceiverStream::new(rx)
}

// 17.04
fn concurrency6() {
    trpl::run(async {
        let messages = get_messages().timeout(Duration::from_millis(200));
        let intervals = get_intervals()
            .map(|count| format!("Interval: {count}"))
            .throttle(Duration::from_millis(100))
            .timeout(Duration::from_secs(10));
        let merged = messages.merge(intervals).take(20);

        let mut stream = pin!(merged);

        while let Some(result) = stream.next().await {
            match result {
                Ok(message) => println!("{message}"),
                Err(reason) => eprintln!("Err: {reason:?}"),
            }
        }
    });
}

// 17.05
fn future_trait() {
    trpl::run(async {
        let (tx, mut rx) = trpl::channel();
        let tx1 = tx.clone();
        let tx1_fut = pin!(async move {
            let vals = vec![String::from("hi"), String::from("from")];

            for val in vals {
                tx1.send(val).unwrap();
                trpl::sleep(Duration::from_millis(500)).await;
            }
        });
        let tx_fut = pin!(async move {
            let vals = vec![String::from("more"), String::from("messages")];

            for val in vals {
                tx.send(val).unwrap();
                trpl::sleep(Duration::from_millis(500)).await;
            }
        });
        let rx_fut = pin!(async {
            while let Some(value) = rx.recv().await {
                println!("Got: {value}");
            }
        });
        let futures: Vec<Pin<&mut dyn Future<Output = ()>>> = vec![tx_fut, tx1_fut, rx_fut];
        trpl::join_all(futures).await; // join_all expects futures items to all implement futures trait
    });
}

#[derive(Debug)]
struct DumbStruct {
    bork: Option<Rc<RefCell<DumbStruct>>>,
}

fn sub_shit() {}

fn moving_shit_around() {
    let rc = Rc::new(RefCell::new(DumbStruct { bork: None }));
    {
        let mut mut_rc = rc.borrow_mut();
        mut_rc.bork = Some(rc.clone());
    }
    let borrowed = rc.borrow();
    if let Some(value) = &borrowed.bork {
        println!("{:?}", value.borrow()); // crashes due to recursion overflowing stack
    }
}

fn main() {
    moving_shit_around();
}
