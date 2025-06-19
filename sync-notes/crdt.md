# CRDT Review

## Intro
Formally, came out of distributed systems research in a paper from 2011 titled `Strong Eventual Consistency and Conflict-Free Replicated Data Types`. [Video by Marc](https://www.youtube.com/watch?v=oyUHd894w18).

A CRDT satisfies these features:
1. Can be replicated independently, concurrently and without coordinating with other replicas.
2. An algorithm automatically resolves inconsistencies.
3. Replicas may differ, but will ultimately converge when all state has been synchronised.

There are two main types of CRDTs, state-based & operation-based.

## A simple CRDT: One-way boolean flag
A boolean value, once true, cannot revert to false.

## State-based CRDTs
AKA convergent replicated data types (CvRDTs). Defined by two types; a type for local state and a type for actions on the state, with three functions (initial state, merge state, update state). Entire local state is sent to other replicas on every update. *Delta state* CRDTs are optimised to only send recent changes instead of entire state.

## Operation-based CRDTs
AKA commutative replicated data types (CmRDTs). Defined without a merge function. Update actions are transmitted directly to replicas and applied. They are not required to be idempotent; stronger assumptions on comms are expected - operations must be delivered without duplication. *Pure* op based CRDTs are a variant that reduces metadata size.

## Comparison
State-based CRDTs are often simpler to design & implement; they require a kind of gossip protocol. Entire state being sent to every other replica can be costly. Op-based are typically smaller.

## Marc Shapiro's talk
Replication is desirable because you can reduce latency for reads & writes across disparate nodes, and be fault-tolerant. CAP Theorem (or Brewer's theorem) states that you can only pick 2 from Consistency, Availability and Partition Tolerance.

E.g. if data is consistent & available, well that requires the whole system to be up - so it isn't a partition tolerant system.

Or if the system is partition tolerant and available, well the data won't be the same.

Of if the system is partition tolerant & consistent, well, then the system state must not be static or crippled.

CONSENSUS: How agents converge on the same answer

## Strong consistency
Previously this was achieved through sequential/linearisable updates - of course this creates a bottleneck as everything must be replayed in the same total order e.g. (2 * 2) + 8 != (2 + 4) * 8 (Same discrete operations, entirely different results)

## Eventual consistency
Order don't matter :) Different local updates to different replicas, they may diverge, but eventually they'll converge. However, their may be a conflict, as the data structures can make references to non-extant data. E.g. it could be wholly orphaned or lead to or add to nothing. Consensus must occur on conflict (arbitrate/rollback). The key is that all types of conflicts must be accounted for. Performance is good! but complexity-wise RIP. Definition:
- Eventual delivery - all nodes receive all updates
- Termination: All update executions terminate
- Convergence: Eventual equivalent state

## STRONG Eventual Consistency (a subset of eventual consistency)
Same idea as eventual consistency, but you have a deterministic outcome for any conflict, during merge on any node. Consensus is on the node, deterministic, local, simple (thus fast)! Partition tolerance yes. Consistency yes. Solves the CAP theorem. Same definition as eventual consistency with a further guarantee:
- Convergence: Correct replicas that have executed the same updates have equivalent state!
