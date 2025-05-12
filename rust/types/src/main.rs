// Generics, traits & lifetimes

fn largest(list: &[i32]) -> &i32 {
    let mut largest = &list[0];

    for item in list {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn main() {
    let number_list = vec![34, 50, 25, 100, 65];
    let res = largest(&number_list);
    println!("the largest number is {res}");
    let number_list = vec![102, 34, 6000, 88, 5, 3, 13];
    let res = largest(&number_list);
    println!("the largest number is {res}")
}
