// Red-black tree toy implementation
// Binary tree = each node only has 2 children max.
// Self-balancing tree where each node has metadata (0/1) representing red vs black
// Root & extreme nodes are black
// The children of red nodes are black
// All external nodes (aka extreme nodes apart from root) have the same BLACK depth

type Color = "red" | "black";

class RedBlackNode {
  val: number | null;
  root: boolean;
  colour: Color;
  left: Node | null;
  right: Node | null;
  constructor(val: number | null, colour: Color, root = false) {
    this.val = val;
    this.root = root;
    this.colour = colour;
  }
}

class RedBlackTree {
  root: RedBlackNode | null = null;
  constructor() {}
  insert(val: number) {
    if (!this.root) {
      this.root = new RedBlackNode(32, "black", true);
      return;
    }
  }
  search(val: number) {
    const _search = (value: number, node: RedBlackNode | null) => {
      if (node === null) return undefined;
      if (value === node.val) {
        return node;
      }
      if (value < node.val) {
      }
      if (value > node.val) {
      }
    };
    _search(val, this.root);
  }
  remove(val: number) {}
}

const tree = new RedBlackTree();
