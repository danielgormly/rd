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
  print(depth = 0) {
    let i = depth;
    let depthMarker = "";
    while (i > 0) {
      depthMarker += "--";
      i--;
    }
    const keys = `[${this.keys.join(",")}]`;
    console.log(`${depthMarker}${keys}`);
    for (let child of this.children) {
      child.print(depth + 1);
    }
  }
}

class Tree234 {
  root = new Node234();
  constructor() {}
  split(node: Node234, middleIndex = 0) {
    const nodeB = new Node234();
    const midKey = node.keys[1];
    nodeB.keys.push(node.keys[2]);
    node.keys.splice(1, 3);
    const upperHalf = node.children.splice(2, 4);
    nodeB.children = upperHalf;
    if (!node.parent) {
      this.root = new Node234();
      node.parent = this.root;
      nodeB.parent = this.root;
      this.root.children = [node, nodeB];
      this.root.keys.push(midKey);
    } else {
      nodeB.parent = node.parent;
      node.parent.children.push(nodeB);
      node.parent.keys.push(midKey);
    }
  }
  private addKey(node: Node234, key: number) {
    if (node.keys.length === 3) {
      this.split(node);
      return this.addKey(node.parent!, key);
    }
    let i = 0;
    while (key > node.keys[i]) {
      i++;
    }
    if (node.isLeaf()) {
      const endKeys = node.keys.splice(i, node.keys.length - i);
      node.keys.push(key);
      node.keys.concat(endKeys);
      return;
    }
    this.addKey(node.children[i], key);
  }
  insert(key: number) {
    this.addKey(this.root, key);
  }
  search() {}
  remove() {}
}

const tree = new Tree234();

for (let i = 1; i < 100; i++) {
  tree.insert(i);
  console.log("i", i);
  tree.root.print();
}
