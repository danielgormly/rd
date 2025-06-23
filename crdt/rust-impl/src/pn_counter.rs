// Positive-Negative Counter
// a counter that can go up and down
// We need to 2 separate states, as GCounters don't play well with negative numbers,
// as the merge operations always takes the maximum number, so a lower value
// will always be overridden
// so a second state can account for negative numbers

use std::collections::HashMap;

pub struct PNCounter {
    pub replica_id: String,
    pub pos_state: HashMap<String, i32>,
    pub neg_state: HashMap<String, i32>,
}

impl PNCounter {
    pub fn new(replica_id: &str) -> Self {
        Self {
            replica_id: replica_id.to_string(),
            pos_state: HashMap::new(),
            neg_state: HashMap::new(),
        }
    }
    // aka update
    pub fn increment(&mut self, amount: i32) -> i32 {
        if amount < 0 {
            panic!("Increment op must take value over 0");
        }
        let counter = self.pos_state.get(&self.replica_id).unwrap_or(&0);
        self.pos_state
            .insert(self.replica_id.clone(), counter + amount);
        self.value()
    }
    pub fn decrement(&mut self, amount: i32) -> i32 {
        if amount < 0 {
            panic!("Decrement op must take value over 0");
        }
        let counter = self.neg_state.get(&self.replica_id).unwrap_or(&0);
        self.neg_state
            .insert(self.replica_id.clone(), counter + amount);
        self.value()
    }
    //aka query
    pub fn value(&self) -> i32 {
        let pos = self.pos_state.values().sum::<i32>();
        let neg = self.neg_state.values().sum::<i32>();
        pos - neg
    }
    pub fn merge(&mut self, other: &Self) {
        for (replica_id, &other_count) in &other.pos_state {
            let self_count = self.pos_state.get(replica_id).unwrap_or(&0);
            self.pos_state
                .insert(replica_id.clone(), (*self_count).max(other_count));
            ()
        }
        for (replica_id, &other_count) in &other.neg_state {
            let self_count = self.neg_state.get(replica_id).unwrap_or(&0);
            self.neg_state
                .insert(replica_id.clone(), (*self_count).max(other_count));
            ()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_counter() {
        let counter = PNCounter::new("replica1");
        assert_eq!(counter.replica_id, "replica1");
        assert_eq!(counter.value(), 0);
    }

    #[test]
    fn test_increment() {
        let mut counter = PNCounter::new("replica1");
        counter.increment(5);
        assert_eq!(counter.value(), 5);
    }

    #[test]
    fn test_decrement() {
        let mut counter = PNCounter::new("replica1");
        counter.decrement(3);
        assert_eq!(counter.value(), -3);
    }

    #[test]
    fn test_increment_and_decrement() {
        let mut counter = PNCounter::new("replica1");
        counter.increment(10);
        counter.decrement(4);
        assert_eq!(counter.value(), 6);
    }

    #[test]
    #[should_panic(expected = "Increment op must take value over 0")]
    fn test_increment_negative_panics() {
        let mut counter = PNCounter::new("replica1");
        counter.increment(-1);
    }

    #[test]
    #[should_panic(expected = "Decrement op must take value over 0")]
    fn test_decrement_negative_panics() {
        let mut counter = PNCounter::new("replica1");
        counter.decrement(-1);
    }
}
