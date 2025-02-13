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

type Color = "red" | "black";

export class RedBlackNode {
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
  isLeaf() {
    return !this.left && !this.right;
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

export class RedBlackTree {
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
    if (this.root) {
      this.root!.red = false;
    }
  }
  private add(node: RedBlackNode, key: number): void {
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
  find(key: number) {
    let cur = this.root;
    while (cur && cur.key != key) {
      if (key < cur.key) {
        cur = cur.left;
      } else {
        cur = cur.right;
      }
    }
    return cur;
  }
  // Find smallest node in right side of tree
  getSuccessor(node: RedBlackNode) {
    let cur = node.right!;
    while (cur.left) {
      cur = cur.left;
    }
    return cur;
  }
  fixDelete(x: RedBlackNode | null) {
    while (x !== this.root && (!x || !x.red)) {
      if (!x?.parent) break;

      if (x === x.parent.left) {
        let w = x.parent.right;
        if (!w) break;

        if (w.red) {
          w.red = false;
          x.parent.red = true;
          this.rotateLeft(x.parent);
          w = x.parent.right;
        }

        if (w && (!w.left || !w.left.red) && (!w.right || !w.right.red)) {
          w.red = true;
          x = x.parent;
        } else {
          if (w && (!w.right || !w.right.red)) {
            if (w.left) w.left.red = false;
            w.red = true;
            this.rotateRight(w);
            w = x.parent.right;
          }

          if (w) {
            w.red = x.parent.red;
            x.parent.red = false;
            if (w.right) w.right.red = false;
            this.rotateLeft(x.parent);
          }

          x = this.root;
        }
      } else {
        let w = x.parent.left;
        if (!w) break;

        if (w.red) {
          w.red = false;
          x.parent.red = true;
          this.rotateRight(x.parent);
          w = x.parent.left;
        }

        if (w && (!w.right || !w.right.red) && (!w.left || !w.left.red)) {
          w.red = true;
          x = x.parent;
        } else {
          if (w && (!w.left || !w.left.red)) {
            if (w.right) w.right.red = false;
            w.red = true;
            this.rotateLeft(w);
            w = x.parent.left;
          }

          if (w) {
            w.red = x.parent.red;
            x.parent.red = false;
            if (w.left) w.left.red = false;
            this.rotateRight(x.parent);
          }

          x = this.root;
        }
      }
    }
    if (x) x.red = false;
  }
  // replace node a with node b, effectively discarding node a
  transplant(a: RedBlackNode, b: RedBlackNode | null) {
    if (!a.parent) {
      this.root = b;
    } else if (a === a.parent.left) {
      a.parent.left = b;
    } else {
      a.parent.right = b;
    }
    if (b) {
      b.parent = a.parent;
    }
  }
  remove(key: number) {
    let z = this.find(key); // find node
    if (!z) return; // Nothing to remove

    let y = z; // node to delete
    let yInitialRed = y.red; // track colour of node to delete
    let x: RedBlackNode | null = null; // node to replace

    if (!z.left) {
      // transplant: is leaf or no left node
      x = z.right; // could be null
      this.transplant(z, z.right); // replace node to delete with node.right
    } else if (!z.right) {
      // transplant: has left but no right child
      x = z.left; // is not null
      this.transplant(z, z.left);
    } else {
      // transplant:  2 children
      y = this.getSuccessor(z); // get minimum rhs val
      yInitialRed = y.red;
      x = y.right;

      if (y.parent === z) {
        if (x) x.parent = y;
      } else {
        this.transplant(y, y.right);
        y.right = z.right;
        if (y.right) y.right.parent = y;
      }
      this.transplant(z, y);
      y.left = z.left;
      y.left.parent = y;
      y.red = z.red;
    }
    // TODO: Simplify
    // TODO: root red checks
    // If og node is red, replacement is nil or red (black node height unchanged within path, red-red not violated)
    if (yInitialRed && (x === null || x.red)) {
      return; // Done
    }
    // if og node is black & replacement is red, colour replacement black (black node height changed, ...?)
    if (yInitialRed === false && x?.red) {
      x.red = false;
      return;
    }
    // height changed but across all nodes, red rule not violated
    if (this.root === x && yInitialRed === false && x && !x.red) {
      return;
    }
    // last cases:
    if (!yInitialRed && (!x || !x.red)) {
      if (x) x.red = true;
    }
    this.fixDelete(x);
    if (this.root) {
      this.root.red = false;
    }
  }
}
