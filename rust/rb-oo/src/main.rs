// use oo::gui;

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

trait State {
    fn content<'a>(&self, post: &'a Post) -> &'a str {
        ""
    }
    fn request_review(self: Box<Self>) -> Box<dyn State>;
    fn approve(self: Box<Self>) -> Box<dyn State>;
    fn reject(self: Box<Self>) -> Box<dyn State>;
    fn approval_count(&self) -> u8 {
        0 // default
    }
}

struct Draft {}

impl State for Draft {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        Box::new(PendingReview { approvals: 0 })
    }
    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }
    fn reject(self: Box<Self>) -> Box<dyn State> {
        self
    }
}

struct PendingReview {
    approvals: u8,
}

impl State for PendingReview {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        Box::new(PendingReview { approvals: 0 })
    }
    fn approve(mut self: Box<Self>) -> Box<dyn State> {
        self.approvals += 1;
        if self.approvals == 2 {
            return Box::new(Published {});
        }
        self
    }
    fn reject(self: Box<Self>) -> Box<dyn State> {
        Box::new(Draft {})
    }
    fn approval_count(&self) -> u8 {
        self.approvals as u8
    }
}

struct Published {}

impl State for Published {
    fn request_review(self: Box<Self>) -> Box<dyn State> {
        self
    }
    fn approve(self: Box<Self>) -> Box<dyn State> {
        self
    }
    fn content<'a>(&self, post: &'a Post) -> &'a str {
        &post.content
    }
    fn reject(self: Box<Self>) -> Box<dyn State> {
        self
    }
}

pub struct Post {
    state: Option<Box<dyn State>>,
    content: String,
}

impl Post {
    fn new() -> Post {
        Post {
            state: Some(Box::new(Draft {})),
            content: String::new(),
        }
    }
    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text)
    }
    pub fn request_review(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.request_review())
        }
    }
    pub fn approve(&mut self) {
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
    if let Some(v) = &post.state {
        println!("Approvals: {}", v.approval_count());
    }
    assert_eq!("", post.content());
    post.approve();
    assert_eq!("I ate a salad for lunch today", post.content());
}
