// Red-black tree toy implementation
// A kind of binary tree with several rules:
// Self-balancing tree where each node is red or black
// Root & leaves (NIL) are black
// The children of red nodes are black
// All paths from a node to its NIL descendents contain the same number of black nodes.

type Color = "red" | "black";

class RedBlackNode {
  val: number;
  root: boolean;
  colour: Color;
  parent: RedBlackNode | null;
  left: RedBlackNode | null;
  right: RedBlackNode | null;
  constructor(val: number, colour: Color, root = false) {
    this.val = val;
    this.root = root;
    this.colour = colour;
  }
}

class RedBlackTree {
  root: RedBlackNode | null = null;
  constructor() {}
  rebalance(node: RedBlackNode) {}
  insert(val: number) {}
  search(val: number) {}
  remove(val: number) {}
}

const tree = new RedBlackTree();
