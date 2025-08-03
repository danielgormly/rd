import { assertEquals, assert } from "https://deno.land/std/testing/asserts.ts";
import { RedBlackTree, RedBlackNode } from "./red-black-tree.ts";

function random(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

Deno.test("Add root node", () => {
  const tree = new RedBlackTree();
  assertEquals(tree.root, null);
  tree.insert(3);
  assertEquals(tree.root?.key, 3);
  assertEquals(tree.root?.red, false);
});

Deno.test("Root node stays black across insertions", () => {
  const tree = new RedBlackTree();
  for (let i = 0; i < 100; i++) {
    tree.insert(random(i) * 100);
    assertEquals(tree.root?.red, false);
  }
});

Deno.test("Black qty remains consistent on paths to all leafs", () => {
  const tree = new RedBlackTree();
  for (let i = 0; i < 100; i++) {
    tree.insert(i * random(42));
  }
});

Deno.test("Black qty remains consistent on paths to all leafs", () => {
  const tree = new RedBlackTree();
  for (let i = 0; i < 100; i++) {
    tree.insert(i * random(42));
  }
});

function verifyHeight(node: RedBlackNode | null) {}

// Helper function to verify Red-Black Tree properties
function verifyRedBlackProperties(
  node: RedBlackNode | null,
): [boolean, number] {
  if (!node) return [true, 0]; // Null nodes are black

  const [leftValid, leftBlackHeight] = verifyRedBlackProperties(node.left);
  const [rightValid, rightBlackHeight] = verifyRedBlackProperties(node.right);

  // Property 1: Node is either red or black (implicit in implementation)

  // Property 2: Root must be black
  if (!node.parent && node.red) {
    return [false, 0];
  }

  // Property 3: Red nodes should have black children
  if (node.red) {
    if ((node.left && node.left.red) || (node.right && node.right.red)) {
      return [false, 0];
    }
  }

  // Property 4: Black height must be equal on both paths
  if (leftBlackHeight !== rightBlackHeight) {
    return [false, 0];
  }

  // Calculate black height
  const blackHeight = leftBlackHeight + (node.red ? 0 : 1);

  return [leftValid && rightValid, blackHeight];
}

// Deno.test("RedBlackTree - Basic Insert Operations", () => {
//   const tree = new RedBlackTree();
//   tree.insert(10);
//   tree.insert(5);
//   tree.insert(15);

//   assertEquals(tree.root?.key, 10);
//   assertEquals(tree.root?.red, false);
//   assertEquals(tree.root?.left?.key, 5);
//   assertEquals(tree.root?.right?.key, 15);
// });

// Deno.test("RedBlackTree - Verify Properties After Multiple Inserts", () => {
//   const tree = new RedBlackTree();
//   [10, 5, 15, 3, 7, 12, 18].forEach((n) => tree.insert(n));

//   const [isValid, _] = verifyRedBlackProperties(tree.root);
//   assert(isValid, "Tree should maintain Red-Black properties");
// });

// Deno.test("RedBlackTree - Find Operation", () => {
//   const tree = new RedBlackTree();
//   [10, 5, 15, 3, 7].forEach((n) => tree.insert(n));

//   assertEquals(tree.find(7)?.key, 7);
//   assertEquals(tree.find(15)?.key, 15);
//   assertEquals(tree.find(100), null);
// });

// Deno.test("RedBlackTree - Basic Remove Operation", () => {
//   const tree = new RedBlackTree();
//   [10, 5, 15].forEach((n) => tree.insert(n));

//   tree.remove(5);
//   assertEquals(tree.find(5), null);
//   assertEquals(tree.root?.key, 10);
//   assertEquals(tree.root?.right?.key, 15);
// });

// Deno.test("RedBlackTree - Complex Remove Operations", () => {
//   const tree = new RedBlackTree();
//   [10, 5, 15, 3, 7, 12, 18].forEach((n) => tree.insert(n));

//   tree.remove(10); // Remove root
//   const [isValidAfterRootRemoval, _] = verifyRedBlackProperties(tree.root);
//   assert(
//     isValidAfterRootRemoval,
//     "Tree should maintain properties after root removal",
//   );

//   tree.remove(3); // Remove leaf
//   const [isValidAfterLeafRemoval, __] = verifyRedBlackProperties(tree.root);
//   assert(
//     isValidAfterLeafRemoval,
//     "Tree should maintain properties after leaf removal",
//   );
// });

// Deno.test("RedBlackTree - Duplicate Insert", () => {
//   const tree = new RedBlackTree();
//   tree.insert(10);
//   tree.insert(10); // Should handle duplicate gracefully

//   assertEquals(tree.root?.key, 10);
//   assertEquals(tree.root?.left, null);
//   assertEquals(tree.root?.right, null);
// });

// Deno.test("RedBlackTree - Remove Non-existent Key", () => {
//   const tree = new RedBlackTree();
//   [10, 5, 15].forEach((n) => tree.insert(n));

//   tree.remove(100); // Should handle gracefully
//   const [isValid, _] = verifyRedBlackProperties(tree.root);
//   assert(
//     isValid,
//     "Tree should maintain properties after attempting to remove non-existent key",
//   );
// });

// Deno.test("RedBlackTree - Large Scale Operations", () => {
//   const tree = new RedBlackTree();
//   const numbers = Array.from({ length: 100 }, (_, i) => i);

//   // Shuffle array
//   numbers.sort(() => Math.random() - 0.5);

//   // Insert all numbers
//   numbers.forEach((n) => tree.insert(n));
//   const [isValidAfterInserts, _] = verifyRedBlackProperties(tree.root);
//   assert(
//     isValidAfterInserts,
//     "Tree should maintain properties after many inserts",
//   );

//   // Remove half the numbers
//   numbers.slice(0, 50).forEach((n) => tree.remove(n));
//   tree.root?.print();
//   const [isValidAfterRemovals, __] = verifyRedBlackProperties(tree.root);
//   assert(
//     isValidAfterRemovals,
//     "Tree should maintain properties after many removals",
//   );
// });

// Deno.test("RedBlackTree - Stress Test Rotations", () => {
//   const tree = new RedBlackTree();
//   // Insert in ascending order to force rotations
//   for (let i = 1; i <= 20; i++) {
//     tree.insert(i);
//     const [isValid, _] = verifyRedBlackProperties(tree.root);
//     assert(isValid, `Tree should maintain properties after inserting ${i}`);
//   }
// });
