# Designing a key-value CRDT for local-first apps

I wanted a key-value object replicated across devices with offline edits, E2EE that converges deterministically. In this article I explore a lot of concepts, some I took on board, others I threw away.

This article is a product of my own research as a developer trying to build a local-first app. I wanted to assemble a simple key-value state object that is guaranteed to converge on the same state across multiple, asynchronous devices. This is a fundmamental primitive for building local-first applications. We will explore various choices you can make that provide different guarantees & both intrinsic to the CRDT and how they are transported.

There are also a lot of existing solutions around for CRDTs. I will not be looking at any of these libraries, but hopefully this info will help you evaluate the popular libraries.

My next planned article is to look at how I use all this theory to design my calendar object CRDT for my upcoming productivity app, [Airday](https://air.day/).

## 1.0 Last Write Wins

Last Write Wins is a very simple concept, once you've defined what "last" means. In a 1 server - n clients model, you can maintain a piece of authoritative state on the server, let's say we update the `name` key to `Ernie` on resource id `ernie_1944`. Clients can request to update `ernie`, even concurrently. The server ultimately sequences the events i.e. processes each event, one after the other and the last update it processes will become the new piece of authoritative state. In the signle server model, the *last request that has hit the server* wins.

Even if two clients make the request at an identical time, the requests will naturally order themselves as they hop through the various forwarding and processing channels (wifi, ethernet, fibre, routers, internal buses, software queues, db transactions, etc). Ultimately we are dealing with a single-master state. The two clients may have received a different view of the world and consequently one will be out of sync and will have to catch up somehow.

This is typically the easiest trusted sync model to implement. A single actor has final responsibility and can perfectly sequence a series of incoming events and eventually discard all events but the latest.

### 1.1 Distributing state

The drawbacks of a single trusted actor model you have a single point of failure, throughput is limited by a single machine & its available bandwidth and latency is fundamentally limited by proximity to the single node. So while you gain simplicity you lose availability.

To increase availability, we can clone the store and place copies closer to potential clients (on the edge, on a database replica, on a ).

Synchronisation is when two spatially separate things, to an independent observer, appear the same. Synchronised swimming is an easy way to understand this. Two people are next to each other in the water but they are doing the same things at the same time. You can focus on one and reasonably expect that the other will be doing the same thing - that is at any one time their state is consistent. So proper synchronisation delivers consistency across nodes.

CAP Theorem, or Brewer's Conjecture shows that a distributed data store must make sacrifice one of Consistency, Availability and Partition Tolerance.

### 1.2 CRDT

Conflict-Free Replicated Data Types are data structures that can be received in any order, any amount of times & will always converge to the same thing. They guarantee what is called "strong, eventual consistency". That is, once all state updates have been shared between n nodes, the state at all n nodes is guaranteed to converge to the same end result.

It is sometimes useful to divide CRDTs into "state-based" and "operation-based" CRDTs, but the distinction can also break down. A state-based CRDT can share the entire current state and operation-based CRDTs can share commands.

The specific & formal mathematical foundations are useful to understand and are linked below.

`a.merge(a, b)`

## 2.0 The design

## The humble LWW-Register CRDT
This is one of the simplest CRDTs. It is conceptually very similar to the single-server based concept instead of the server sequencing via recieve time, the clients apply a local timestamp to each update before they share it. When

## Timestamps, incl. clock skew / HLCs

## Operations

## Dots

(actor, counter)

## Tombstones

## Compaction

## Live CRDT versus "CRDT" in storage
This is a concept that took me a little bit to understand

## "Causality" in LWW-Registers

Causality is a tenuous notion in LWW-Registers. Unless you implemented specific cumbersome UX patterns, you don't have any real proof that the real life user ever "saw" what data existed immediately prior to rewriting it.

However, we shouldn't throw away the notion of causality in an LWW-register map. there is an interesting idea here that can help avoid impossible states through incongruent key-value combinations. To demonstrate:

## MV-Register
MV-Registers offer an alternative to steam-rolling over existing registers.

## Cryptographic authenticity via signatures

Encryption

## Implicit "seen-before" through Version Vectors

## Explicit "seen-before" through a Merkle-DAGs

## Materialisation

## E2EE

## Transport

Op-based

## Anti-entropy / Sync protocols

## Schema Evolution

## Theoretical foundations

A lot of these concepts I found were moderately difficult conceptually for me. Some papers I read that helped lay the groundwork include:

(order theory)

-
-
-
