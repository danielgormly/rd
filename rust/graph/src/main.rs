use std::cell::RefCell;
use std::rc::Rc;

// We use Box to allocate values on the Heap
// ensuring data redirection, allowing for data structures of sizes unknown at compile time
// In operations where a data structure with a Box is dropped, code is added to traverse through its data structures
//
// Rc<T> is a reference counted smart pointer; so unlike box, you can have multiple copies of the same data referenced
// they are immutable copies however
// When ref counts hit 0 = observed & cleaned up
// So there is a runtime cost
//
// RefCell<T> this allows you to take mutable copies of the same underlying data
//
// So Rc<RefCell<i32>>
// is saying that you can hold multiple immutable references to a RefCell that you CAN mutate.
// RefCell<Rc<i32>>, you wouldn't be able to modify the i32, but you could swap out the RC & double the RefCell

struct Graph {
    nodes: Vec<Rc<Node>>,
}

impl Graph {
    fn new() -> Self {
        Graph { nodes: vec![] }
    }
    fn add_node(&mut self, node: Node) -> usize {
        self.nodes.push(Rc::new(node));
        self.nodes.len() - 1
    }
    fn connect_nodes(&self, from_idx: usize, to_idx: usize) {
        let from_node = &self.nodes[from_idx];
        let to_node = Rc::clone(&self.nodes[to_idx]);

        // Get mutable borrow
        let mut connections = from_node.connections.borrow_mut();

        connections.push(to_node);
    }
}

struct Node {
    value: i32,
    connections: RefCell<Vec<Rc<Node>>>,
}

impl Node {
    fn new(value: i32) -> Self {
        Self {
            value,
            connections: RefCell::new(vec![]),
        }
    }
    fn count_conn(&self) -> i32 {
        let count = self.connections.borrow().len();
        count as i32
    }
}

fn main() {
    let mut graph = Graph::new();
    let first = Node::new(1);
    let first_idx = graph.add_node(first);
    let child_node = Node::new(2);
    let child_idx = graph.add_node(child_node);
    let second_parent_node = Node::new(2);
    let second_parent_idx = graph.add_node(second_parent_node);
    graph.connect_nodes(child_idx, first_idx);
    graph.connect_nodes(child_idx, second_parent_idx);
    println!(
        "val: {}, conn: {}",
        graph.nodes[0].value,
        graph.nodes[0].count_conn()
    );
}
