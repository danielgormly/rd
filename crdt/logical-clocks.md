## Lamport Clock
https://martinfowler.com/articles/patterns-of-distributed-systems/lamport-clock.html

System timestamp is not monotonic - they can go backwards as they run fast & then sync to a NTP & they can conflict so cannot be reliably compared. This can lead to disparate state across agents, esp. in the context of a LWW.

A lamport clock is a shared clock maintained by the server, which increments on server write. The causal chain of requests are maintained. It is like a common tick.

Using lamport clock alone for LWW is not a great idea, because while causal order is preserved, a lamport tick on concurrent individual clients can be the same, so a lamport clock lww still requires server-authoritative or other consensus to break a tie.

```rust
struct LamportClock {
    time: i64,
}
impl LamportClock {
    fn new() -> Self {
        LamportClock { time: 0 }
    }
    fn tick(&self) {
        self.time + 1;
    }
    fn update(&mut self, received_time: i64) {
        self.time = received_time.max(self.time) + 1
    }
    fn current_time(&self) -> i64 {
        self.time
    }
}
```

## Hybrid logical clocks
We could use wall clock (approx, client local time) + tick (local client tie breaker) + pid (inter-client tie breaker) as the basis of our LWW-Register implementation. This is a good enough, simple solution for high-trust environments.
