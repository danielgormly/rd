pub trait Messenger {
    fn send(&self, msg: &str);
}

pub struct LimitTracker<'a, T: Messenger> {
    messenger: &'a T,
    value: usize,
    max: usize,
}

impl<'a, T> LimitTracker<'a, T>
where
    T: Messenger,
{
    pub fn new(messenger: &'a T, max: usize) -> LimitTracker<'a, T> {
        LimitTracker {
            messenger,
            value: 0,
            max,
        }
    }

    pub fn set_value(&mut self, value: usize) {
        self.value = value;

        let percentage_of_max = self.value as f64 / self.max as f64;

        if percentage_of_max >= 1.0 {
            self.messenger.send("error: over quota");
        } else if percentage_of_max >= 0.9 {
            self.messenger.send("warning: 90% quota");
        } else if percentage_of_max >= 0.75 {
            self.messenger.send("warning: 75% quota");
        }
    }
}

#[cfg(test)]
mod tests {
    use std::cell::RefCell;

    use super::*;
    struct MockMessenger {
        sent_messages: RefCell<Vec<String>>,
    }

    impl MockMessenger {
        fn new() -> MockMessenger {
            MockMessenger {
                sent_messages: RefCell::new(vec![]),
            }
        }
    }

    impl Messenger for MockMessenger {
        fn send(&self, message: &str) {
            self.sent_messages.borrow_mut().push(String::from(message))
        }
    }

    #[test]
    fn it_sends_an_over_75_percent_warning_message() {
        let mock_mesenger = MockMessenger::new();
        let mut limit_tracker = LimitTracker::new(&mock_mesenger, 100);

        limit_tracker.set_value(80);

        assert_eq!(mock_mesenger.sent_messages.borrow().len(), 1);
    }
}
