## Discrete Mathematics Refresh for CRDTs

A set = {a, b, c, d}

## Poset
A Partially Ordered Set (poset). A set e.g. `{a, b, c, d}` in which exist ordered pairs e.g. (a,b) (a,c) (a,d) (b,c) (b,d).

The pairs have a consistent binary relation <= (used as an arbitrary relational symbol) that satisfies:
- Reflexivity: a <= a for all a
- Antisymmetric: if a<= b and b <= a, then a = b
- Transitive: if a <= b and b <= c then a <= c

https://www.youtube.com/watch?v=XJQqDDTNvJA

## Semi-lattice
A set, with a partial order, and an operation (join) that can take any two values and give you a least upper-bound on those two values.

## Upper bound:
Given elements a & b in a POSET, an upper bound is any element c such that a <=c AND b <= c

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

Associative (A⊔B)⊔C = A⊔(B⊔C) = ORDER OF OPERATIONS OF GROUPS DOES NOT MATTER
Commutative = A⊔B = B⊔A ORDER OF OPERATIONS OF PAIRS DOES NOT MATTER
Idempotent = A⊔A = APPLYING SAME DATA TWICE = NO PROBLEM

E.g. G-Counter
SA (node1: 5, node2: 3)
SB (node1: 4, node2: 7)
Join max(5,4) = 5, max(3, 7) = 7
