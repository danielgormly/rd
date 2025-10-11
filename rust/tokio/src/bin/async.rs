use tokio::net::TcpStream;

async fn my_async_fn() {
    println!("hell from async");
    let _socket = TcpStream::connect("127.0.0.1:3000").await.unwrap();
    println!("async TCP operation complete");
}

#[tokio::main]
async fn main() {
    let what_is_this = my_async_fn();
    what_is_this.await;
}
