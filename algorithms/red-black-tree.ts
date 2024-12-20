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
  constructor(key: number, colour: Color, parent: RedBlackNode | null = null) {
    this.key = key;
    this.red = colour === "red" ? true : false;
    this.parent = parent;
  }
  print(prefix = "", isLeft = true) {
    console.log(
      prefix +
        (!this.parent ? "root:" : isLeft ? "l:" : "r:") +
        this.key +
        "(" +
        (this.red ? "red" : "black") +
        ")",
    );
    this.left && this.left.print(prefix + (isLeft ? "    " : "│   "), true);
    this.right && this.right.print(prefix + (isLeft ? "    " : "│   "), false);
  }
}

class RedBlackTree {
  root: RedBlackNode | null = null;
  constructor() {}
  rotateLeft(pivot: RedBlackNode) {
    const newRoot = pivot.right!;
    pivot.right = newRoot.left;
    if (newRoot.left) newRoot.left.parent = pivot;
    newRoot.parent = pivot.parent;
    if (!pivot.parent) {
      this.root = newRoot;
    } else if (pivot === pivot.parent.left) {
      pivot.parent.left = newRoot;
    } else {
      pivot.parent.right = newRoot;
    }
    newRoot.left = pivot;
    pivot.parent = newRoot;
  }
  rotateRight(pivot: RedBlackNode) {
    const newRoot = pivot.left!;
    pivot.left = newRoot?.right;
    if (newRoot.right) newRoot.right.parent = pivot;
    newRoot.parent = pivot.parent;
    if (!pivot.parent) {
      this.root = newRoot;
    } else if (pivot === pivot.parent.right) {
      pivot.parent.right = newRoot;
    } else {
      pivot.parent.left = newRoot;
    }
    newRoot.right = pivot;
    pivot.parent = newRoot;
  }
  balance(node: RedBlackNode) {
    while (node.parent && node.parent.red) {
      if (!node.parent.parent) {
        // parent is root, no grandparent = no aunt
        this.root!.red = false;
        return;
      }
      const leftBranch = node === node.parent.left;
      const leftSubtree = node.parent === node.parent.parent.left;
      const aunt = leftSubtree
        ? node.parent.parent.right
        : node.parent.parent.left;
      // Recolour op (red aunt)
      if (aunt && aunt.red) {
        node.parent.red = false;
        aunt.red = false;
        node.parent.parent.red = true;
        node = node.parent.parent;
        continue; // Move up the tree
      } else {
        // Rotate op (black aunt)
        if (leftSubtree) {
          if (!leftBranch) {
            // lr case
            node = node.parent;
            this.rotateLeft(node);
          }
          // ll case
          node.parent!.red = false;
          node.parent!.parent!.red = true;
          this.rotateRight(node.parent!.parent!);
          break;
        } else {
          if (leftBranch) {
            // rl case
            node = node.parent!;
            this.rotateRight(node);
          }
          // rr case
          node.parent!.red = false;
          node.parent!.parent!.red = true;
          this.rotateLeft(node!.parent!.parent!);
          break;
        }
      }
    }
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
      this.balance(node.left);
      return;
    }
    if (key > node.key) {
      if (node.right) {
        return this.add(node.right, key);
      }
      node.right = new RedBlackNode(key, "red", node);
      this.balance(node.right);
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
[10, 8, 12, 9, 7, 6, 5, 14, 53, 3, 6, 2, 99, 65, 43].forEach((n, i) => {
  tree.insert(n);
  console.log("Iteration", i);
  tree.root!.print();
});
