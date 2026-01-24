# Notes on Brewer's Conjecture / CAP Theorem paper
article 564585.564601

Distributed web services design seems to involve tradeoff between Consistency, Availability & Partition Tolerance. The article proves the issue in the "asynchronous network model", discusses solutions in the "partially synchronous model".

## 1. Introduction
Eric Brewer a professor at Berkeley posited the CAP tradeoff in a talk in 2000. The paper was published 2002.

Refresher on ACID:
Atomic - transaction succeeds or fails
Consistency - Moves through valid transition states without invalidating invariants.
Isolated - A single transaction has the same view of data not inteferred with by another transaction.
Durable - lasts after commit - usually so performance is still good through a WAL.

So CAP is like ACID for web services, we want:
Consistency - same view of data across nodes
Availability - services should be highly available - available all the time to everyone who wants it
Partition tolerance - service should keep running if there's a network split

## 2. Formal model

- Atomic data objects i.e. linearizable e.g. You can't take $100 2x from an account with only $100 in it. And if you could it would result in -$100 - transactions must take into account all & concurrent transactions. All nodes return the same final balance after commit occurs.
- Available data objects i.e. requests for data must succeed - valid response generated from requests
- Partition tolerance - the above two must hold despite lost intrasystem messages e.g. across distributed data stores

## 3. Asynchronous networks
Network of {G1, G2} can be partitioned into {G1} and {G2}, no messages can be transferred between sets. Obviously, a write in G1 cannot be returned in a read from G2.

A is an algorithm that meets atomicity, availability & partition tolerance.

Formal Example:
1. An atomic object has value v0.
2. a1 = prefix of execution of A in which a write != v0 completes in G1.
NO TRANSFER BETWEEN G1 & G2
3. a2 = prefix of execution of a read in G2.

when v0 is mutated to v1 on G1, the minimum requirement is that message transfer between G1 & G2 must be allowed to see v1 at G2. Partition precludes message transfer between G1 & G2. Therefore the minimum requirement cannot be met.

It then goes onto say that, partitions are unpredictable - you cannot know if a message is lost or not, thus there is no perfect algorithm A across a distributed system. You can respond after a timeout - sacrificing consistency. Or you could wait indefinitely - but then you're sacrificing availability. Detection of a partition is impossible in bounded time.

Thus, theorem 1 says that there's no way to build an algorithm within an async network model in which availability & atomic consistency are guaranteed and messages are lost.

Later, Corollary 1.1 says that there's no way to build an algorithm within an async network in which availability & atomic consistency are guaranteed where no messages are lost - simply because we can't differentiate between slow & lost messages.

## 3.2 Asynchronous solutions

Atomic, Partition Tolerant (CP): Algorithms that do have failure points but can tolerate say <50% splits e.g. RAFT/Paxos/leader-election stuff. There's a single node that can be moved around, but yes it sacrifices availability.

Atomic, Available (CA): There are no partitions, atomic transactions either succeed and are available or fail and are unavailable. If there are partitions

Atomic, Partition-Tolerant: Ez, the good enough cache / CDN mentality

## 4. Partially Synchronous Solutions

Every node has a clock with their own times, but with the same run rate.
Clocks are used as timers that can be used

my take is... you can build a system that puts "slow or dead" messages into one category "too slow" in a timely fashion, you can't *know* if your message was received or not, but you can make assumptions about system health. no node can know if they are healthy or everyone else is. so ultimately you try to make a system that can band together a majority - thus you can run on a crippled, but not a severely crippled majority
