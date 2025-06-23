mod g_counter;
mod pn_counter;

use g_counter::GCounter;
use pn_counter::PNCounter;

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
