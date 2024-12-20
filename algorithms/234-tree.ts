// 2-3-4 tree: O(logn) time for insertion, searching, removal. O(n) for space.
// This is the tree that the red-black tree was derived from
// Every node is either:
// A 2 node: 1 data element, if internal 2 children
// A 3 node: 2 data elements, if internal 3 children
// A 4 node: 3 data elements, if internal 4 children
// All external nodes i.e. leaves are at the same depth
// Data is kept in sorted order

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

export class Tree234 {
  root = new Node234();
  constructor() {}
  split(node: Node234, middleIndex = 0) {
    const nodeB = new Node234();
    const midKey = node.keys[1];
    nodeB.keys.push(node.keys[2]);
    node.keys.splice(1, 3);
    const upperHalf = node.children.splice(2, 4);
    upperHalf.map((n) => (n.parent = nodeB));
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
    if (key === node.keys[i]) {
      console.warn("Skipping duplicate key", key);
      return;
    }
    if (node.isLeaf()) {
      const endKeys = node.keys.splice(i, node.keys.length - i);
      node.keys.push(key);
      node.keys.push(...endKeys);
      return;
    }
    this.addKey(node.children[i], key);
  }
  insert(key: number) {
    this.addKey(this.root, key);
  }
  private findInNode(node: Node234, key: number) {
    let i = 0;
    while (key > node.keys[i]) {
      i++;
    }
    if (key === node.keys[i]) {
      return node;
    }
    if (node.isLeaf()) return;
    return this.findInNode(node.children[i], key);
  }
  search(key: number) {
    return this.findInNode(this.root, key);
  }
  remove() {}
}
