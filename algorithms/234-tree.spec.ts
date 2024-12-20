import { Tree234 } from "./234-tree.ts";

const tree = new Tree234();

for (let i = 1; i < 100; i++) {
  tree.insert(Math.floor(Math.random() * 100));
}
tree.insert(44);

tree.root.print();

const t = tree.search(44);
console.log(t);
