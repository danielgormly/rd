fn main() {
  let mut x = 5;
  println!("The value of x is {x}");
  x = 6;
  println!("The value of x is now {x}, this is possible because x is explicityl declared a mutable val with the mut keyword");
  const TWO_HOURS_IN_SECONDS: u32 = 2 * 60 * 60;
  println!("the value of 2 hours in seconds, determined by factors 2, 60, 60 at compile time is {TWO_HOURS_IN_SECONDS}");

  let y = 5;
  let y = y + 5;
  println!("y was originally 5, now shadowed as original y + 5, so y={y}");
  {
    let y = y * 5;
    println!("shadowed again in an inner scope as {y}");
  }

  println!("but in our parent scope, y is still {y} as before");

  let tuppie: (i32, f32, f64) = (4, 4.0, 4.0);

  println!("My tuple's values are {}, {}, {}", tuppie.0, tuppie.1, tuppie.2);

  let arrieta: [f32; 2] = [2.0, 4.0];
  println!("my array has {} vals of {} and {}", arrieta.len(), arrieta[0], arrieta[1]);

}
