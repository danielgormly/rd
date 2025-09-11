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

enum Operation {
    Read,
    Write
}

// Note: Things like tokio::net::tcp::TcpStream implements Reactor code for you!

struct PrintBytesRead {
    // But with 0_NONBLOCKING set
    fd: std::net::TcpSTREAM,
}

impl Future for PrintBytesRead {
    type Item = ();
    type Error = ();
    fn poll(&mut self) - Result<Async<Self::Item>, Self::Error> {
        loop {
            match self.fd.read() {
                Ok(r) => {
                    eprintln!("got {} bytes", r.len())
                }
                Err(io::Error::WouldBlock) => {
                    // do something to make sure we are woken up
                    let reactor = Handle::current();
                    match PollEvented::new_with_handle(self.fd, reactor).poll_read_ready() {
                        Ok(Async::Ready(_)) => {
                            // socket became ready when we read and called poll_read_ready()
                            continue;
                        },
                        Ok(Async::NotReady) => return Ok(Async::NotReady),
                        Err(e) => return Err(e),
                    }
                    return Ok(Async::NotReady);
                }
                Err(io::Error::Closed) => {
                    return Ok(Async::Ready(()));
                }
                Err(e) => return Err(e);
            }
        }
    }
}

impl Executor {
    fn run_all(&mut self, futures: Vec<F>) -> Vec<usize, Result<F::Item, F::Error>>
   where F: Future {
        let mut done = 0;
        let mut results = Vec::with_capacity(futures.len());
        let nf = Arc::new(MyNotifier(Mutex::new(vec![true; futures.len()])));
        let notifier = NotifyHandle::new(nf);
        let mut waiting_for = HashMap<(FD, Operation), Task);

        while done != futures.len() {
            for (i, f) in futures.iter_mut().enumerate() {
                // Don't pull futures that can't make progress
                let was_notified = self.0.lock();
                if !was_notified[i] {
                    continue;
                }
                was_notified[i] = false;
                drop(was_notified);
                // with_default is giving us the current reactor handle
                // Notified poll() is called within a closure, and a notifier for the entire executor + a particular id is given
                match timer::with_default(... ||, reactor::with_default(&my_handle, || executor::with_notify(&notifier, i, || f.poll()))) {
                    // tokio_reactor::Handle::current() -> Handle
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
        // Check file descriptors with epoll syscall
        while let Some((t, fd, op)) = notify_me.try_recv() {
            waiting_for.insert((fd, op), task);
        }
        let select = waiting_for.keys().collect();
        for (fd, op) in epoll_timeout(select, min_remaining_timeout) {
            let task = waiting_for.remove((fd, op)).notify();
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

## Kernel FS
Kernel maintains file connections, app uses sys calls to get back an int related to the open file. e.g.

```pseudocode
x = connect(...) -> 5; // file-descriptor
x.connect('foo'); // i.e. alias for syscall: write(5, 'foo');
```

You can set sys calls on a socket to be non-blocking. A non-blocking read without data to reeturn may return WOULD_BLOCK.

You could loop through syscalls for !WOULD_BLOCK res, but this would become wildly inefficient.

epoll (linux): Give it many file descriptors & operation and the kernel will efficiently notify you when these are ready.

epoll blocks until something happens - i.e. something is ready for reading/writing/etc! i.e. I guess you'd use it in a loop.

## Tokio
Above we saw the types Rust provides a common interface detailing for async/await operations, but it does not actually provide an implementation. This is where tokio comes in; event-driven, non-blocking I/O platform.

## tokio::reactor
The event loop that drives all Tokio I/O resources. This could be implemented within the Executor thread!

## tokio::runtime
A reactor, an executor and a timer (timer is just like reactor)!

https://youtu.be/9_3krAQtD2k?t=6635
