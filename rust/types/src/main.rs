use types::aggregator::{Summary, Tweet, notify};

// Generics, traits & lifetimes

fn largest_i32(list: &[i32]) -> &i32 {
    let mut largest = &list[0];

    for item in list {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn largest_char(list: &[char]) -> &char {
    let mut largest = &list[0];

    for item in list {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn largest<T: std::cmp::PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];

    for item in list {
        if item > largest {
            largest = item;
        }
    }

    largest
}

struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}

fn main() {
    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 5.0, y: 10.0 };

    let tweet = Tweet {
        username: String::from("horse_ebooks"),
        content: String::from("of course"),
        reply: false,
        retweet: false,
    };

    notify(&tweet);

    println!(
        "{} {} {} {} {} {}",
        integer.x(),
        integer.y,
        float.x,
        float.y,
        float.distance_from_origin(),
        tweet.summarize(),
    );

    let number_list = vec![34, 50, 25, 100, 65];
    let res = largest(&number_list);
    println!("the largest number is {res}");
    let chars = vec!['b', 'y', 'l', 'l', 'c'];
    let res = largest_char(&chars);
    println!("the largest char is {res}")
}
