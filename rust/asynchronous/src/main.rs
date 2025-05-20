use std::time::Duration;

use trpl::{Either, Html};

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

fn main() {
    concurrency3();
}
