struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}

struct Color(i32, i32, i32);

struct UnitLike; // unit-like struct

fn to_string(color: Color) -> String {
    let Color(r, g, b) = color; // destructure syntax
    format!("RGB({}, {}, {})", r, g, b)
}

fn main() {
    let mut user1 = build_user(
        String::from("someone@whatever.com"),
        String::from("someusername"),
    );
    user1.email = String::from("hello@hello.com");
    let user2 = User {
        email: String::from("someoneelse@whatever.com"),
        ..user1
    };
    print_user(user2);
    // print_user(user1); impossible due to partial move
    let black = Color(0, 0, 0);
    println!("{}", to_string(black));
    // Unit-like structs
    let _gumbo = UnitLike; // Not really sure wtf the point of this is yet
}

fn build_user(email: String, username: String) -> User {
    User {
        active: true,
        username,
        email,
        sign_in_count: 1,
    }
}

fn print_user(user: User) {
    println!(
        "{}:{}:{}:{}",
        user.email, user.username, user.active, user.sign_in_count
    );
}
