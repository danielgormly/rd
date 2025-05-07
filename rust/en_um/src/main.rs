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

fn main() {
    let home = IpAddrKind::V4(127, 0, 0, 1);
    let loopback = IpAddrKind::V6(String::from("::1"));
    loopback.print();
    home.print();
    let status = Some(false);
    let test = Test { status };
    println!("{:?}", status);
    println!("{:?}", test);

    // route(home);
    // route(loopback);
}

// fn route(ip_kind: IpAddrKind) {}
