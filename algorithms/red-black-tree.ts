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
  // Black aunt rotate
  // Red aunt colourflip
  rebalance(node: RedBlackNode) {
    if (node.parent && node.parent.parent) {
      if (node.parent.parent.right === node) {
        // left uncle
      } else {
        // right uncle
      }
    }
  }
  insert(val: number) {
    if (!this.root) {
      this.root = new RedBlackNode(val, "black", true);
      return;
    }
    const _insert = (curNode: RedBlackNode, node: RedBlackNode) => {
      if (val === curNode.val) {
        return console.warn("Discarding duplicate node");
      }
      if (val < curNode.val) {
        if (!curNode.left) {
          curNode.left = node;
          node.parent = curNode;
          this.rebalance(node);
        }
      }
      if (val > curNode.val) {
        if (!curNode.right) {
          curNode.right = node;
          node.parent = curNode;
          this.rebalance(node);
        }
      }
    };
    const newNode = new RedBlackNode(val, "red");
    _insert(this.root, newNode);
  }
  search(val: number) {
    const _search = (node: RedBlackNode | null) => {
      if (node === null) return undefined;
      if (val === node.val) {
        return node;
      }
      if (val < node.val) {
        return _search(node.left);
      }
      if (val > node.val) {
        return _search(node.right);
      }
    };
    _search(this.root);
  }
  remove(val: number) {}
}

const tree = new RedBlackTree();
