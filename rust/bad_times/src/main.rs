use std::fs::File;
use std::io::{self, ErrorKind, Read};

// fn error_match() {
//     let file_res = File::open("hello.txt"); // File doesn't exist
//     let file = match file_res {
//         Ok(file) => file,
//         Err(error) => match error.kind() {
//             ErrorKind::NotFound => match File::create("hello.txt") {
//                 Ok(fc) => fc,
//                 Err(e) => panic!("Problem creating the file {e:?}"),
//             },
//             other_error => {
//                 panic!("Problem opening the file: {other_error:?}");
//             }
//         },
//     };
// }

// fn idx_panic() {
// let v = vec![1, 2, 3];
// v[99]; this will panic
// }
//

fn main() {
    // read_user_from_file();
    read_user_from_file_short().expect("failed");
}

// fn read_user_from_file() -> Result<String, io::Error> {
//     // error_match();
//     let file_res = File::open("hello.txt");

//     let mut file = match file_res {
//         Ok(file) => file,
//         Err(e) => return Err(e),
//     };

//     let mut username = String::new();

//     match file.read_to_string(&mut username) {
//         Ok(_) => Ok(username),
//         Err(e) => Err(e),
//     }
// }

// Propagating the error using the ? operator
fn read_user_from_file_short() -> Result<String, io::Error> {
    // error_match();
    let mut username_file = File::open("hello.txt")?; // Question mark propogates the error
    let mut username = String::new();
    username_file.read_to_string(&mut username)?;
    Ok(username)
}

// Showing how the ? operator can work
// fn last_char_of_first_line(text: &str) -> Option<char> {
//     text.lines().next()?.chars().last()
// }
