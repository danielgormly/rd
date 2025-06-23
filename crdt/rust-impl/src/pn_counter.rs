// Positive-Negative Counter
// a counter that can go up and down
// We need to 2 separate states, as GCounters don't play well with negative numbers,
// as the merge operations always takes the maximum number, so a lower value
// will always be overridden
// so a second state can account for negative numbers

use std::collections::HashMap;

#[derive(Debug, Clone)]
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
    #[test]
    fn test_merge_behavior() {
        let mut counter_a = PNCounter::new("replica-a");
        let mut counter_b = PNCounter::new("replica-b");

        counter_a.increment(10);
        counter_a.decrement(3); // A: +10, -3 = 7

        counter_b.increment(5);
        counter_b.decrement(8); // B: +5, -8 = -3

        counter_a.merge(&counter_b);
        assert_eq!(counter_a.value(), 4); // (10+5) - (3+8) = 4

        // Test idempotency
        counter_a.merge(&counter_b);
        assert_eq!(counter_a.value(), 4); // Should remain 4
    }

    #[test]
    fn test_concurrent_operations() {
        let mut replica_a = PNCounter::new("a");
        let mut replica_b = PNCounter::new("b");

        // Simulate concurrent operations
        replica_a.increment(7);
        replica_b.decrement(2);

        // Both replicas merge
        replica_a.merge(&replica_b);
        replica_b.merge(&replica_a);

        // Should converge to same value
        assert_eq!(replica_a.value(), 5); // 7 - 2
        assert_eq!(replica_b.value(), 5); // Should be identical
    }

    #[test]
    fn test_commutativity() {
        let mut counter_a1 = PNCounter::new("a");
        let mut counter_b1 = PNCounter::new("b");
        let mut counter_c1 = PNCounter::new("c");

        counter_a1.increment(3);
        counter_b1.decrement(2);
        counter_c1.increment(5);

        // Create copies for reverse merge order
        let mut counter_a2 = counter_a1.clone();
        let mut counter_b2 = counter_b1.clone();
        let mut counter_c2 = counter_c1.clone();

        // Forward: A ← B ← C
        counter_a1.merge(&counter_b1);
        counter_a1.merge(&counter_c1);

        // Reverse: A ← C ← B
        counter_a2.merge(&counter_c2);
        counter_a2.merge(&counter_b2);

        assert_eq!(counter_a1.value(), counter_a2.value());
        assert_eq!(counter_a1.pos_state, counter_a2.pos_state);
        assert_eq!(counter_a1.neg_state, counter_a2.neg_state);
    }
}
