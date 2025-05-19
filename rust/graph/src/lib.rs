pub mod graph {
    use std::cell::RefCell;
    use std::rc::Rc;

    pub struct Graph {
        pub nodes: Vec<Rc<Node>>,
    }

    impl Graph {
        pub fn new() -> Self {
            Graph { nodes: vec![] }
        }
        pub fn add_node(&mut self, node: Node) -> usize {
            self.nodes.push(Rc::new(node));
            self.nodes.len() - 1
        }
        pub fn connect_nodes(&self, from_idx: usize, to_idx: usize) {
            let from_node = &self.nodes[from_idx];
            let to_node = Rc::clone(&self.nodes[to_idx]);

            // Get mutable borrow
            let mut connections = from_node.connections.borrow_mut();

            connections.push(to_node);
        }
    }

    pub struct Node {
        pub value: i32,
        pub connections: RefCell<Vec<Rc<Node>>>,
    }

    impl Node {
        pub fn new(value: i32) -> Self {
            Self {
                value,
                connections: RefCell::new(vec![]),
            }
        }
        pub fn count_conn(&self) -> i32 {
            let count = self.connections.borrow().len();
            count as i32
        }
    }
}

pub mod tree {
    use std::{
        cell::RefCell,
        rc::{Rc, Weak},
    };

    #[derive(Debug)]
    pub struct Node {
        pub value: i32,
        pub parent: RefCell<Weak<Node>>,
        pub children: RefCell<Vec<Rc<Node>>>,
    }
}
