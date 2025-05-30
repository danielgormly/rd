pub mod aggregator {
    pub trait Summary {
        fn summarize_author(&self) -> String;
        fn summarize(&self) -> String {
            format!("read more from {}...", self.summarize_author()) // a default implementation
        }
    }

    pub trait Display {}

    pub struct NewsArticle {
        pub headline: String,
        pub location: String,
        pub author: String,
        pub content: String,
    }

    impl Summary for NewsArticle {
        fn summarize_author(&self) -> String {
            format!("by {}", self.author)
        }
    }

    pub struct Tweet {
        pub username: String,
        pub content: String,
        pub reply: bool,
        pub retweet: bool,
    }

    impl Summary for Tweet {
        fn summarize_author(&self) -> String {
            format!("@{}", self.username)
        }
    }
    pub fn notify(item: &impl Summary) {
        println!("Breaking news! {}", item.summarize())
    }
    // longer form trait bound syntax, with a type intersection:
    pub fn warn<T: Summary + Display>(item: &T) {
        println!("ADVERTENCIA! {}", item.summarize());
    }
}
