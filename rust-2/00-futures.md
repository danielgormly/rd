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
struct Executor(Arc<Mutex<Vec<bool>>>);

struct MyNotifier(Mutex<Vec<bool>>);

impl Notify for MyNotifier {
    fn notify(&self, id: usize) {
        self.0.lock()[id] = true;
    }
}

impl Executor {
    fn run_all(&mut self, futures: Vec<Future>) -> Vec<Result<Future::Item, Future::Error>> {
        let mut done = 0;
        let mut results = Vec::with_capacity(futures.len());
        let nf = Arc::new(MyNotifier(Mutex::new(vec![true; futures.len()])));
        let notifier = NotifyHandle::new(nf);

        while done != futures.len() {
            for (i, f) in futures.iter_mut().enumerate() {
                // Don't pull futures that can't make progress
                let was_notified = self.0.lock();
                if !was_notified[i] {
                    continue;
                }
                was_notified[i] = false;
                // Noticed poll() is called within a closure, and a notifier for the entire executor + a particular id is given
                match executor::with_notify(&notifier, i, || f.poll()) {
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
                        // meanwhile, thread T notices that a network packet arrived
                        // f *must* have arranged for tasks[i] (its task) to be notified later
                        continue;
                    }
                }
            }
        }
        // wait for Task::notify to be called
    }
}
```

## Poll
Queries a future to see if its value has become available, registering interest if not. Poll should never block!

task::park retrieves a handle to the current Task. task::unpark is called when the future is ready to make progress.

## Task
`futures::task:current` - poll can use this to get a handle to the current executor. Tasks can be sent around to other threads etc, and eventually when the Task can progress, that thread can call "notify" on the task to intimate that you may be able to make progress.

Struct futures::task::Task
```rust
pub struct Task {};
pub fn notify(&self);
pub fn is_current(&self) -> bool;
```

## Tokio
Above we saw the types Rust provides a common interface detailing for async/await operations, but it does not actually provide an implementation. This is where tokio comes in; event-driven, non-blocking I/O platform.
