#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let scale = 2;
    let rect1 = Rectangle {
        width: 30 * scale,
        height: 50 * scale,
    };
    println!(
        "The area of the rect {:#?} is {} sq px",
        rect1,
        area(&rect1)
    );
    dbg!(&rect1);
}

fn area(rect: &Rectangle) -> u32 {
    rect.width * rect.height
}
