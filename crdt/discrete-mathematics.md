## Discrete Mathematics Refresh for CRDTs
- Good post on order theory https://blog.jtfmumm.com//2015/11/17/crdt-primer-1-defanging-order-theory/

## A set
a grouping of elements {a, b, c, d}

## Binary relation
Denoted with <=, the typical incrementing integer, but can be any kind of relationship (descendent-parent, greater than, has more letters than, etc)

## Order
A binary relation <= on a set S, written `< S, <= >`
So, take a set, and establish binary relationships between

## Incomparability
Sometimes denoted `∥` e.g. `a ∥ b`. This is two items in a set that cannot be compared with the stated binary relation.

## Total Order Set
E.g. a set of integers with a <= relation can all be compared to each other, the order is total.

## Partial Order Set (Poset)
A Partially Ordered Set (poset). A set e.g. `{a, b, c, d}` in which exist ordered pairs e.g. (a,b) (a,c) (a,d) (b,c) but not necessarily (d, c)

The pairs have a consistent binary relation <= that satisfies:
- Reflexivity: a <= a for all a
- Antisymmetric: if a<= b and b <= a, then a = b
- Transitive: if a <= b and b <= c then a <= c

## Transitivity
a relation a to c that holds through a <= b and a <= c
E.g. Sydney is in Australia, Australia is in the Southern Hemisphere, therefore Sydney is in Southern Hemisphere. If we added Canada to this set, it would be incomparable with Sydney, Australia and the Southern Hemisphere. Thus it would have a partial order.

## Vector clock
e.g. `(4, 3, 1)` - each element corresponding to a node or process. A collection of integer-based logical timestamps. The binary relation <= is `happened-before` and is defined as: vector A happened-before vector B iff all corresponding elements in vector A are less than or equal to the corresponding elements in vector B, AND at least one element in A is strictly less than the corresponding element in B.

For vectors A = (a₁, a₂, ..., aₙ) and B = (b₁, b₂, ..., bₙ):
A ≤ B ⟺ (∀i: aᵢ ≤ bᵢ) ∧ (∃j: aⱼ < bⱼ)

`(1, 3, 2) <= (1, 4, 6)` This holds true
`(1, 6, 2) ∥ (5, 2, 9)` This is incomparable, as we treat the vector clock as a discrete element, and the relation <= cannot be established.

## Upper bound
the element that is >= on every other element within the set in terms of that relation.

## Join
For a set S, an order < S, <= >, and two elements a,b∈S, the join of and and b `a ∨ b`, is a least upper bound of S according to said order. So it's the lowest thing that joins 2 elements together.

e.g. for integers, the join `2 ∨ 5` is 5. It is the largest number that satisfies the relation <= for both numbers. 2 is less than 5, 5 is less than 5.

## Commutativity
a ∨ b = b ∨ a
It doesn't matter what order we take the join of our elements in.
Even ≤ is non-commutative. A commutative relationship implies when comparing any two items, we can only go forward! e.g. a max() operation.

## Associativity
(a ∨ b) ∨ c = a ∨ (b ∨ c)
The grouping does not matter! For some functions like averaging, the grouping absolutely matters!

## Idempotence
a ∨ a = a
You can find the join of the join and the result, which will continue being the result and thus the join!

## Upper bound:
Given elements a & b in a POSET, an upper bound is any element c such that a <=c AND b <= c

## Join semi-lattice
An order `< S, <= >` for which there exists a join `x ∨ y` for any `x,y ∈ S`. So basically it's an order of a set that guarantees we can find a join (least upper bound) for any two elements.

## Monotonic join semi-lattice
Same thing, but its naming gives particular importance to the fact that joins always go up or be the upper bound of both.

## State-based CRDT:
- Join-semilattice where
Elements = all possible states of the data structure
Paritial order = "causally precedes" or "is subsumed by"
Join operation = merge function that resolves conflicts

Process:
1. replica a with SA receives SB from replica b
2. the poset relationship ensures states can be ordered meaningfully
3. join operation SA.SB gives us the merged state
4. This merged state is always "greater than or equal to" both input states

E.g. G-Counter
SA (node1: 5, node2: 3)
SB (node1: 4, node2: 7)
Join max(5,4) = 5, max(3, 7) = 7

## Discrete Math Symbols

| Symbol | Name | Definition |
|--------|------|------------|
| ∈ | Element of | a ∈ S means a is an element of set S |
| ∉ | Not element of | a ∉ S means a is not an element of set S |
| ⊆ | Subset | A ⊆ B means every element of A is also in B |
| ⊂ | Proper subset | A ⊂ B means A ⊆ B and A ≠ B |
| ∪ | Union | A ∪ B is the set of elements in A or B |
| ∩ | Intersection | A ∩ B is the set of elements in both A and B |
| ∅ | Empty set | The set containing no elements |
| ≤ | Less than or equal | Binary relation, can be ordering |
| ∥ | Incomparable | Elements that cannot be compared |
| ∨ | Join/Supremum | Least upper bound of two elements |
| ∧ | Meet/Infimum | Greatest lower bound of two elements |
| ⊔ | Lattice join | Join operation in lattice theory |
| ⊓ | Lattice meet | Meet operation in lattice theory |
| ⊥ | Bottom element | Least element in a poset |
| ⊤ | Top element | Greatest element in a poset |
| ∀ | For all | Universal quantifier |
| ∃ | There exists | Existential quantifier |
| ∴ | Therefore | Logical conclusion |
| ∵ | Because | Logical reasoning |
| ⟺ | If and only if | If A is true, then B is true, if B is true, then A is true
