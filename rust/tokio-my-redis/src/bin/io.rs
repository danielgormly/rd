use tokio::fs::File;
use tokio::io::{self, AsyncReadExt, AsyncWriteExt};

#[tokio::main]
async fn main() -> io::Result<()> {
    let mut f = File::open("foo.txt").await?;
    // let mut buffer = [0; 10];
    let mut buffer = Vec::new();

    let mut file = File::create("foo.txt").await?;
    let n = file.write(b"some bytes").await?;

    // read up to 10 bytes
    // let n = f.read(&mut buffer).await?;
    f.read_to_end(&mut buffer).await?;
    println!("The bytes: {:?}", &buffer[..]);
    Ok(())
}
