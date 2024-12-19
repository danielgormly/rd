import { Tree234 } from "./234-tree.ts";

const tree = new Tree234();

for (let i = 1; i < 10; i++) {
  tree.insert(i);
}
for (let i = 1000; i > 0; i--) {
  tree.insert(i);
}

tree.root.print();
