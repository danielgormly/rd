use rand::Rng;

#[derive(Debug)]
enum IpAddrKind {
    V4(u8, u8, u8, u8),
    V6(String),
}

impl IpAddrKind {
    fn print(&self) {
        println!("Printing an ip but not yet {:?}", self);
    }
}

type Status = Option<bool>; // inbuilt Option enum (instead of say a null value)

#[derive(Debug)]
struct Test {
    status: Status,
}

#[derive(Debug)]
enum Quality {
    Bronze,
    Gold,
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
    LuckyCoin(Option<Quality>),
    Shrapnel,
    Garbage,
}

fn value_in_cents(coin: &Coin) -> f64 {
    match coin {
        Coin::Penny => 1.0,
        Coin::Nickel => 5.0,
        Coin::Dime => 10.0,
        Coin::Quarter => 25.0,
        Coin::LuckyCoin(quality) => {
            let mut lower_range: u8 = 1;
            let mut upper_range: u8 = 50;
            match quality {
                Some(Quality::Gold) => {
                    lower_range = 25;
                    upper_range = 150;
                    println!("Flipping lucky gold coin!!!!");
                }
                _ => {}
            }
            let random_int_val: f64 = rand::rng().random_range(lower_range..=upper_range).into();
            random_int_val
        }
        _ => 0.1,
    }
}

fn main() {
    let home = IpAddrKind::V4(127, 0, 0, 1);
    let loopback = IpAddrKind::V6(String::from("::1"));
    loopback.print();
    home.print();
    let status = Some(false);
    let test = Test { status };
    println!("{:?}", status);
    println!("{:?}", test);
    let coin_bag: Vec<Coin> = vec![
        Coin::Penny,
        Coin::LuckyCoin(Some(Quality::Gold)),
        Coin::Garbage,
    ];
    let sum = sum_coins(&coin_bag);
    println!("your coin bag is worth ${}", sum);

    let mut config_max = Some(53u8);
    config_max = None; // enable this line triggers _ option, thus showing Some() and None satisfy Option type, we don't need to explicitly define.
    match config_max {
        Some(max) => println!("The max to be configured is {max}"),
        _ => (),
    }

    // Concise way of writing same logic, ommitting _
    // Introducing a let with Some(x)
    let config_min = Some(3u8);
    if let Some(min) = config_min {
        println!("min config is {min}");
    } else {
        // This block is redundant
    }

    let gold_coin = Coin::Garbage;
    let Coin::LuckyCoin(quality) = gold_coin else {
        println!("My coin is not a lucky one");
        return ();
    };
}

fn sum_coins(coin_bag: &Vec<Coin>) -> f64 {
    let mut sum: f64 = 0.0;
    for coin in coin_bag.iter() {
        let val = value_in_cents(&coin);
        sum = sum + val;
    }
    sum
}

// fn route(ip_kind: IpAddrKind) {}
