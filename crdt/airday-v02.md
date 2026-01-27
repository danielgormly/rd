# Designing & handling a key-value CRDT into a local-first app

This covers my experience as a builder, building a LWW-Register map for use in my upcoming productivity app [Airday](https://air.day/). I wanted a key-value object replicated across devices with offline edits, E2EE that converges deterministically. I evaluate several design options & explain how I integrate them into the the application.

There are CRDTs out there but probably suffice, however I want to understand mine deeply & keep my primary app very low dependency.

This article is a product of my own research as a developer trying to build a local-first app. I wanted to assemble a simple key-value state object that is guaranteed to converge on the same state across multiple, asynchronous devices. This is a fundmamental primitive for building local-first applications. We will explore various choices you can make that provide different guarantees & both intrinsic to the CRDT and how they are transported.

There are also a lot of existing solutions around for CRDTs. I will not be looking at any of these libraries, but hopefully this info will help you evaluate the popular libraries.

My next planned article is to look at how I use all this theory to design my calendar object CRDT for my upcoming productivity app, [Airday](https://air.day/).

## A rough CRDT timeline

## Existing libraries
There are several CRDT libraries around like:
- Automerge
- YJS
- Loro
- Cola

If you want list or text you probably want one of these.

## 1.0 Last Write Wins

Last Write Wins is a very simple concept, once you've defined what "last" means. In a 1 server - n clients model, you can maintain a piece of authoritative state on the server, let's say we update the `name` key to `Ernie` on resource id `ernie_1944`. Clients can request to update `ernie`, even concurrently. The server ultimately sequences the events i.e. processes each event, one after the other and the last update it processes will become the new piece of authoritative state. In the signle server model, the *last request that has hit the server* wins.

Even if two clients make the request at an identical time, the requests will naturally order themselves as they hop through the various forwarding and processing channels (wifi, ethernet, fibre, routers, internal buses, software queues, db transactions, etc). Ultimately we are dealing with a single-master state. The two clients may have received a different view of the world and consequently one will be out of sync and will have to catch up somehow.

This is typically the easiest trusted sync model to implement. A single actor has final responsibility and can perfectly sequence a series of incoming events and eventually discard all events but the latest.

### 1.1 Distributing state

The drawbacks of a single trusted actor model you have a single point of failure, throughput is limited by a single machine & its available bandwidth and latency is fundamentally limited by proximity to the single node. So while you gain simplicity you lose availability.

To increase availability, we can clone the store and place copies closer to potential clients (on a CDN, on a database replica, on a phone, etc).

Synchronisation is when two spatially separate things, to an independent observer, appear the same. Synchronised swimming is an easy way to understand this. Two people are next to each other in the water but they are doing the same things at the same time. You can focus on one and reasonably expect that the other will be doing the same thing - that is at any one time their state is consistent. So proper synchronisation delivers consistency across nodes.

CAP Theorem shows that a distributed data store must make sacrifice one of Consistency, Availability and Partition Tolerance. TODO: Brewer's Conjecture. This is a useful framework to consider when making decisions in distributed systems.

### 1.2 CRDT

Conflict-Free Replicated Data Types are data structures that can be received in any order, any amount of times & will always converge to the same thing. They guarantee what is called "strong, eventual consistency". That is, once all state updates have been shared between n nodes, the state at all n nodes is guaranteed to converge to the same end result.

It is sometimes useful to divide CRDTs into "state-based" and "operation-based" CRDTs, but the distinction can also break down. A state-based CRDT can share the entire current state and operation-based CRDTs can share commands.

The specific & formal mathematical foundations are useful to understand and are linked below.

The CRDT/offline tradeoffs are additional complexity & lugging around historical data to keep everyone in sync.

`a.merge(a, b)`

## Order theory
Order theory goes deep, to read the average CRDT paper, you shouldn't need too much of it, but you will need to understand the basics of set theory & order theory.

## 2.0 The design

## The humble LWW-Register CRDT

```json
 {
   "timestamp": 1,
   "value": "Ernie",
 }
```

This is one of, if not the simplest CRDT. It is conceptually similar to the single-server based concept instead of the server sequencing via recieve time, each writer i.e. clients sequences it via a timestamp they add on write. When another client receives an update, they compare the incoming timestamp to the existing timestamp. If the incoming timestamp is greater, they merge that data & timestamp. If the incoming timestamp is less than the existing timestamp, the incoming operation is discarded. If the incoming timestamp is the same, it will need to rely on a secondary deterministic order token.

You could use a LWW-Register to track an object, but you would have to write the entire object at every pass. This makes a lot of operations heavier - as you always have to pass around and write the entire object each update. What we will do instead is create a CRDT to track multiple attributes.

## Turning the LWW-Register CRDT into a map
We're going to extend the single LWW-Register CRDT into a LWW-Register map. Instead of 2 LWW-Registers of `Ernie` and `42`, we can have:

```json
{
  "name": {
    "timestamp": 1,
    "value": "Ernie",
  },
  "age": {
    "timestamp": 1,
    "value": 42,
  },
  "occupation": {
    "timestamp": 2,
    "value": null,
  }
}
```

```javascript
LWWRegister {
  timestamp: {
    utc: number,
    pid: number,
  },
  data: any,
  // We will go into comparison details later
  function merge(other: LWWRegister) {
    if (other.timestamp > this.timestamp) {
      return other;
    }
  }
}
```

This is obviously useful for encapsulating attributes of the same conceptual object.

## Snapshots, caches & operations

Your "live" CRDT may look quite different to an operation in transport, and a little different to the cached version. You

## Timestamps, incl. clock skew / HLCs

Logical clock

Microseconds vs nano-seconds
BigInt vs 53-bit integers

HLC?

Wall clock?

Tie-breakers

## Analyzing the offline for 3 months problem (?)

## Dots

Provides an addressable history

(actor, counter)

## Delete & Tombstones

This is where you may have to bring in OR-Set - i.e if your individual is part of a set.

## Snapshots & compaction

Compaction implies removal of history, so you need to decide if this is acceptable or not.

## "Causality" in LWW-Registers

Causality is a tenuous notion in life and particularly so in LWW-Registers. We're really talking about determining a sequence of events i.e. which can be done through providing evidence of a "happens-before" relationship, and/or sequencing according to a synchronised clock. The latter is fraught with risk due to clock-sync but still useful for concurrent events.

Unless you implemented specific cumbersome UX patterns, you don't have any real proof that the real life user ever "saw" what data existed immediately prior to rewriting it.

We are really talking about happens-before & "concurrency" rather.

However, we shouldn't throw away the notion of causality in an LWW-register map. there is an interesting idea here that can help avoid impossible states through incongruent key-value combinations. To demonstrate:

## MV-Register
MV-Registers offer an alternative to steam-rolling over existing registers.

## Cryptographic authenticity via signatures

In a typical central server - client relationship where each device has credentials to confirm its identity, signatures are not really necessary. However if information can flow outside of this channel - i.e. P2P or download & uploading a back-up, signatures become vital to ensure that information is not forged between users.

## Implicit "seen-before" through Version Vectors
Version Vectors (v) can be used to track causal relationships between patches. These come under happens-before (<=) and therefore converse (<=), or concurrently (||). We don't need VVs for LWW but if we want to show a complete history we can.

TODO: Hybrid? i.e. use this to decide on merge? Or is that more explicitly / better done through MV-Register?!

They do rely on the clients being correct & honest, especially under encryption. Ultimately, they only constitute a claim about what an actor has seen, not a fact.

For the record, Vector Clocks are a near-identical concept, but explicitly define send & receive events that update the clock - it is a more general purpose distributed event happens-before-tracking.

## Explicit "seen-before" through a Merkle-DAG

This is an alternative to Version Vectors & creates a stronger "happens-before" claim that takes the last hash or set of hashes, the "heads" and also computes a new hash. The hashes are both addressable and can be used to verify the causal claims. You could theoretically still tamper with this by selectively choosing older hashes, for example, or a set of hashes that don't quite make sense, but it is more tamper-evident.

## Materialisation



## End-to-end Encryption

I won't go over exactly how I achieved end to end encryption here, but I will go into a couple caveats.

You need some protection against faulty or malicious clients & to build resiliency against mismatched server/client combos, stale data etc. Ideally, you only invite high trust clients into your domain.

## Transport

Op-based CRDTs mean we do not have to transfer an entire object, only changesets.

## Sync protocols

The goal of the sync protocol is to efficiently, timely & correctly ensure that clients and servers provide the same data to the end user.

## Schema Evolution

Schema evolution is important to consider,

## Theoretical foundations

A lot of these concepts I found were moderately difficult conceptually for me. Some papers I read that helped lay the groundwork include:

- Order theory?
- OG Lamport paper
- Marc Shapiro's talk
- Woot paper
- Cola blogpost
