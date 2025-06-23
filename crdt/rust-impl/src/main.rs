// Grow-only, positive counter implementation
// The goal is a data-type implementing an int that can be serialised
// deserialised, added to, shared with only local consensus
//
// to build a counter with conensus, we could use a single master to determine the next state
// (whose election may need consensus itself!)
// If we have 2 clients, they would need to send increment operations rather than state updates
//
// our crdt can be a state based crdt

use std::collections::HashMap;

struct GCounter {
    replica_id: String,
    state: HashMap<String, i32>,
}

impl GCounter {
    fn new(replica_id: &str) -> Self {
        Self {
            replica_id: replica_id.to_string(),
            state: HashMap::new(),
        }
    }
    fn increment(&mut self, amount: i32) -> i32 {
        let counter = self.state.get(&self.replica_id).unwrap_or(&0);
        self.state.insert(self.replica_id.clone(), counter + amount);
        self.value()
    }
    fn value(&self) -> i32 {
        self.state.values().sum()
    }
    fn merge(&mut self, other: &GCounter) {
        for (replica_id, &other_count) in &other.state {
            let self_count = self.state.get(replica_id).unwrap_or(&0);
            self.state
                .insert(replica_id.clone(), (*self_count).max(other_count));
            ()
        }
    }
}

fn main() {
    let mut counter = GCounter::new("client-3");
    counter.increment(1);
    assert_eq!(counter.value(), 1);
    let mut counter2 = GCounter::new("client-2");
    counter2.increment(5);
    assert_eq!(counter2.value(), 5);
    counter.merge(&counter2);
    assert_eq!(counter.value(), 6);
    counter.merge(&counter2);
    assert_eq!(counter.value(), 6); // idempotent
    counter2.merge(&counter);
    assert_eq!(counter2.value(), 6); // commutative! (same in either order)
}
