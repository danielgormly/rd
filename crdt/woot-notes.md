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

A topological sort order does not reliably produce the same outputs. A monotonic insert function however adds a function to ensure each operation, even if concurrently added, goes up. So, we need a monotonic linear extension to interpolate a total order.

WOOT first solves this by using an ID as a tie-breaker, however it is still not solved!
