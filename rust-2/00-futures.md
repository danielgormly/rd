# Notes on The What and How of Futures and async/await
Video by Jon Gjengset at https://www.youtube.com/watch?v=9_3krAQtD2k

## Futures
Express a value that is not yet ready. Analogous to JS promises. A building block of asynchronous code.

## Futures Trait
Futures are implemented through the Future Trait in Rust
```rust
pub trait Future {
    type Item; // associated type of Future
    type Error; // failure type of Future
    fn poll(&mut self) -> Poll<Self::Item, Self::Error>; // where the magic happens
}
```

Poll takes a mutable reference to self, and returns type Poll<T, E> = Result<Async<T>, E>; where Async =

```
pub enum Async<T> {
  Ready(T),
  NotReady,
}
```

## Executors
The runtime that orchestrates asynchronous functions & structures. An naive executor might look like this:

```rust
struct Executor;

impl Executor {
    fn run_all(&mut self, futures: Vec<Future>) -> Vec<Result<Future::Item, Future::Error>> {
        let mut done = 0;
        let mut results = Vec::with_capacity(futures.len());

        while done != futures.len() {
            for (i, f) in futures.iter_mut().enumerate() {
                match f.poll() { // poll() should never block!
                    Ok(Async::Ready(t)) => {
                        // Problem 1: We are going to call pole after it's done
                        results.push(i, Ok(t));
                        done += 1;
                    }
                    Err(e) => {
                        results.push(i, Err(e));
                        done += 1;
                    }
                    Ok(Async::NotReady) => {
                        // Problem 1: We are going to loop on this indefinitely at an unbounded rate
                        continue;
                    }
                }
            }
        }
    }
}
```
