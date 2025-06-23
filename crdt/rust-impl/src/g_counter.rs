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

pub struct GCounter {
    pub replica_id: String,
    pub state: HashMap<String, i32>,
}

impl GCounter {
    pub fn new(replica_id: &str) -> Self {
        Self {
            replica_id: replica_id.to_string(),
            state: HashMap::new(),
        }
    }
    // aka update
    pub fn increment(&mut self, amount: i32) -> i32 {
        let counter = self.state.get(&self.replica_id).unwrap_or(&0);
        self.state.insert(self.replica_id.clone(), counter + amount);
        self.value()
    }
    //aka query
    pub fn value(&self) -> i32 {
        self.state.values().sum()
    }
    pub fn merge(&mut self, other: &Self) {
        for (replica_id, &other_count) in &other.state {
            let self_count = self.state.get(replica_id).unwrap_or(&0);
            self.state
                .insert(replica_id.clone(), (*self_count).max(other_count));
            ()
        }
    }
}
