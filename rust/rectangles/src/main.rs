#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
    fn width(&self) -> bool {
        self.width > 0
    }
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
    fn square(size: u32) -> Self {
        Self {
            width: size,
            height: size,
        }
    }
}

fn main() {
    let scale = 2;
    let rect1 = Rectangle {
        width: 30 * scale,
        height: 50 * scale,
    };
    let rect2 = Rectangle {
        width: 30,
        height: 50,
    };
    println!("The area of the rect1 is {} sq px", rect1.area());
    if rect1.width() {
        println!("The rectangle's width is {}", rect1.width)
    }
    if rect2.can_hold(&rect1) {
        println!("rect 2 can hold rect 1")
    }
    if rect1.can_hold(&rect2) {
        println!("rect 1 can hold rect 2")
    }
    let mini_square = Rectangle::square(2); // associated function
    if rect1.can_hold(&mini_square) {
        println!("mini square fits")
    }
    dbg!(&rect1);
}
