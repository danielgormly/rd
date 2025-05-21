// use oo::GUI;

// fn render() {
//     let screen = GUI::Screen {
//         components: vec![
//             Box::new(crate::GUI::SelectBox {
//                 width: 75,
//                 height: 10,
//                 options: vec![
//                     String::from("Yes"),
//                     String::from("Maybe"),
//                     String::from("No"),
//                 ],
//             }),
//             Box::new(crate::GUI::Button {
//                 width: 50,
//                 height: 10,
//                 label: String::from("OK"),
//             }),
//         ],
//     };
// }

// https://doc.rust-lang.org/stable/book/ch18-03-oo-design-patterns.html

enum PostState {
    Draft,
    Pending,
    Approved,
}

trait State {
    fn request_review(self: Box<self>) -> Box<dyn State>;
    fn approve(self: Box<Self>) -> Box<dyn State>;
}

struct Draft {}

impl State for Draft {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        Box::new(PendingReview {})
    }
    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }
}

struct PendingReview {}

impl State for PendingReview {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        Box::new(PendingReview {})
    }
    fn approve(self: Box<Self>) -> Box<dyn State> {
        Box::new(Published {})
    }
}

struct Published {}

impl State for Published {
    fn content<'a>(&self, post: &'a Post) -> &'a str {
        ""
    }
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }
    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }
}

struct Post {
    content: String,
    state: Option<Box<dyn State>>,
}

impl Post {
    fn new(&self, content: String) -> Self {
        Post {
            content,
            state: PostState::Draft,
        }
    }
    fn add_text(&mut self, text: &str) {
        self.content.push_str(text)
    }
    fn request_review(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.request_review())
        }
    }
    fn approve(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.approve())
        }
    }
    pub fn content(&self) -> &str {
        self.state.as_ref().unwrap().content(self)
    }
}

fn main() {
    let mut post = Post::new();
    post.add_text("I ate a salad for lunch today");
    assert_eq!("", post.content());
    post.request_review();
    assert_eq!("", post.content());
    post.approve();
    assert_eq!("I ate a sald for lunch today", post.content());
}
