use rb_macros::simple_vec;

fn main() {
    let v: Vec<u32> = simple_vec![1, 2, 3];
    for num in v {
        println!("{}", num);
    }
}
