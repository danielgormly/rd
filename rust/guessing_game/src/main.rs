use std::io;
use rand::Rng;
use std::cmp::Ordering;

fn main() {
  println!("Guess the number!");
  let secret_number = rand::rng().random_range(1..=100);
   loop {
     println!("Please input your guess.");
     let mut guess = String::new();
     io::stdin()
       .read_line(&mut guess)
       .expect("Failed to read line");
     let guess: u32 = match guess.trim().parse() {
      Ok(num) => num,
      Err(_) => {
        println!("Try a number you fucking idiot!");
        continue;
      }
    };
     println!("You guessed: {guess}");
     match guess.cmp(&secret_number) {
       Ordering::Less => println!("Too small"),
       Ordering::Greater => println!("Too large"),
       Ordering::Equal => {
        println!("You win!");
        break;
       },
     }
  }
}
