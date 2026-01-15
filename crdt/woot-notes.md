# Notes on paper: Data Consistency for P2P Collaborative Editing
https://dl.acm.org/doi/10.1145/1180875.1180916
2006 paper on a proposal for distributed consensus of "data" by peers without central coordinators.

P2P is great for coordinating sharing of immutable content.

## (the problem with) Vector clocks
An array of logical clocks, one clock per site, used to detect happen-before relationships and therefore the concurrency between each operation. VC are unbounded if node length is unbounded, so scaling to wikipedia levels of collaboration can become problematic. WOOT proposes a solution where number of sites "is not a variable" - i think this means it has absolutely no specific bearing on the exchanged data.

## WOOT
1. Peers generate and apply operations immediately.
2. Peers disseminate to other peers through whatever mechanism.
3. Operations are applied on receive amongst peers.

3 qualities a group editor maintains are:

- intention preservation: preservation of effect of op as it was when created.
ins(a ≺ e ≺ b) - inserts element e between a & b
del(e) - deletes e
n.b. identification is via element, not position, entails characteristics:
1. ins must work even after a or b have been deleted
2. deletes must retain identifying information within tombstone
Woot thus deals with blocks, as opposed to contents.

- causal consistency
Preconditions are required as the execution of del(e) requires e to be present and ins(a<e<b) requires a and b or their tombstones to be present. Causal consistency ensures that causative order is respected.

- convergence
Peers with the same set of ops should converge on the same end result. Each insert generates two new order relationships, generating a partial order, not a total order. Hasse diagram can show the partial order visually.

A topological sort order does not reliably produce the same outputs. A monotonic insert function however adds a function to ensure each operation, even if concurrently added, goes up. So, we need a monotonic linear extension to interpolate a total order. WOOT first solves this by using an ID as a tie-breaker, however it is still not solved! Because if the operations are received differently, i.e. are applied in a different order, you get different results.

To demonstrate:

site 1:
op1: ins(a ≺ 1 ≺ b) → a1b
op3: ins(a ≺ 3 ≺ 1) → a31b
op2: ins(a ≺ 2 ≺ b) → ??? we can't JUST do id comparison here, because it needs to respect the existing partial order.

op1: ins(a ≺ 1 ≺ b) → a1b
op2: ins(a ≺ 2 ≺ b) → a12b (since 1 <id 2)
op3: ins(a ≺ 3 ≺ 1) → a312b ()

or as the paper describes it
> ins(a ≺ 2 ≺ b) there is already ’3’ and ’1’ between ’a’ and ’b’. If we suppose that the identifier order is ’1’<id’2’<id’3’,

So, ’1’ <id ’2’ <id ’3’ is NOT a relation - it is a tie-breaker - only applied when necessary. We first need to respect relations, which is all 3 ops!

the solution is:

an algorithm would look between a & b, and first see 1, and not bother seeing 3, because 3 is a dependent of 1 i.e. they have a relationship that must be respected first

so you do not tie break against 3, but 1.
