// Red-black tree toy implementation
// A kind of binary tree with several rules:
// Self-balancing tree where each node is red or black
// Root & leaves (NIL) are black
// The children of red nodes are black
// All paths from a node to its NIL descendents contain the same number of black nodes.
// If aunt is black: rotate
// If aunt is red: colour-flip
// After rotation three nodes end up as black -> red/red
// After colour-flip: parent ends up as red -> black/blacks
//
// Rotations:
//

type Color = "red" | "black";

class RedBlackNode {
  key: number;
  red: boolean;
  parent: RedBlackNode | null = null;
  left: RedBlackNode | null = null;
  right: RedBlackNode | null = null;
  constructor(key: number, colour: Color, parent?: RedBlackNode = null) {
    this.key = key;
    this.red = "red" ? true : false;
    this.parent = parent;
  }
  print() {}
}

class RedBlackTree {
  root: RedBlackNode | null = null;
  constructor() {}
  balance(node: RedBlackNode) {
    // if (node.color = red)
  }
  add(node: RedBlackNode, key: number) {
    if (key === node.key) {
      console.warn("skipping duplicate key", key);
    }
    if (key < node.key) {
      if (node.left) {
        return this.add(node.left, key);
      }
      node.left = new RedBlackNode(key, "red", node);
      return;
    }
    if (key > node.key) {
      if (node.right) {
        return this.add(node.right, key);
      }
      node.right = new RedBlackNode(key, "red", node);
      return;
    }
  }
  insert(key: number) {
    if (!this.root) {
      this.root = new RedBlackNode(key, "black");
      return;
    }
    this.add(this.root, key);
  }
  search(key: number) {}
  remove(key: number) {}
}

const tree = new RedBlackTree();
tree.insert(3);
tree.insert(4);
tree.insert(2);
tree.insert(6);
tree.insert(7);

function printTree(node, prefix = "", isLeft = true) {
  if (node === null) return;
  console.log(
    prefix +
      (!node.parent ? "root:" : isLeft ? "l:" : "r:") +
      node.key +
      "(" +
      (node.red ? "red" : "black") +
      ")",
  );
  printTree(node.left, prefix + (isLeft ? "    " : "│   "), true);
  printTree(node.right, prefix + (isLeft ? "    " : "│   "), false);
}

printTree(tree.root);
// console.log(tree.root);
