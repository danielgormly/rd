// 2-3-4 tree: O(logn) time for insertion, searching, removal. O(n) for space.
// This is the tree that the red-black tree was derived from
// Every node is either:
// A 2 node: 1 data element, if internal 2 children
// A 3 node: 2 data elements, if internal 3 children
// A 4 node: 3 data elements, if internal 4 children
// All external nodes i.e. leaves are at the same depth
// Data is kept in sorted order
// Easy explanation https://www.thecrazyprogrammer.com/2021/04/2-3-4-trees.html

class Node234 {
  keys: number[] = [];
  children: Node234[] = [];
  parent: Node234 | null = null;
  constructor() {}
  isLeaf() {
    return this.children.length === 0;
  }
  is4Node() {
    return this.keys.length === 3;
  }
  print() {
    return `${this.keys.join(",")}`;
    // children: this.children.map((c) => c.toJSON()),
  }
}

class Tree234 {
  root = new Node234();
  constructor() {}
  split(nodeA: Node234, middleIndex = 0) {
    const nodeB = new Node234();
    nodeB.parent = nodeA.parent;
    nodeA.parent.children.push(nodeB);
    nodeB.keys.push(nodeA.keys[2]);
    nodeA.parent?.keys.push(nodeA.keys[1]);
    nodeA.keys = [nodeA.keys[0]];
  }
  inject(node: Node234, key: number) {
    let i = node.keys.length - 1;
    if (node.isLeaf()) {
      node.keys[i + 1] = node.keys[i];
      i--;
    } else {
      while (i >= 0 && key < node.keys[i]) {
        i--;
      }
      i++;
      if (node.children[i].is4Node()) {
        this.splitChild(node, i);
        if (key > node.keys[i]) {
          i++;
        }
      }
      this.inject(node.children[i], key);
    }
  }
  insert(key: number) {
    if (this.root?.is4Node()) {
      const newRoot = new Node234(); // Create new node to hoist up
      const oldRoot = this.root; // Ref old node
      oldRoot.parent = newRoot; // old root descendend of new
      newRoot.children.push(oldRoot); // and establishing inverse relation
      this.root = newRoot; // and reassign root
      this.split(oldRoot); // we still need to split up the old node
    }
    this.inject(this.root, key);
  }
  search() {}
  remove() {}
}

const tree = new Tree234();
for (let i = 1; i < 10; i++) {
  tree.insert(i);
}
console.log(tree.root.print());
