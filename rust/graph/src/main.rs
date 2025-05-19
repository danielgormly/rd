use ref_cycle::graph::{Graph, Node};

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
