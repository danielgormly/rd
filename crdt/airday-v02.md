# Designing & handling a key-value CRDT into a local-first app

This covers my research and implementation, building a LWW-Register map for use in my upcoming local-first productivity app [Airday](https://air.day/). I wanted a key-value object replicated across devices with offline edits, E2EE that converges deterministically. I evaluate several design options & explain how I integrate them into the the application.

There are many more comprehensively tested & more performant libraries built from CRDT primitives that work well, however I want to understand mine deeply and keep dependencies low on my data core.

## Contents

<ol class="!list-none">
  <li><a href="#1-background">1. Background</a></li>
  <li><a href="#2-airdays-crdt-design">2. Airday's CRDT Design</a></li>
  <li><a href="#3-synchronisation">3. Synchronisation</a></li>
  <li><a href="#4-storage-and-loading">4. Storage and loading</a></li>
  <li><a href="#5-materialisation">5. Materialisation</a></li>
  <li><a href="#6-references">6. References</a></li>
</ol>

## 1. Background

### 1.1 Traditional atomic transactions guarantees

Let's say we have a database row with id `jonathan_1978`. `jonathan_1978` has a `name` value of `Jonathan`. 2 clients request distinct name changes concurrently, one to `Jono` and the other to `Big Jon`. In most default modes of traditional Relational Databases (RDBMS), concurrent transactions affecting the same row will run as if serialised (i.e. played in sequence), creating a total order for these transactions and ultimately choosing the last to execute, e.g. `SET name = "Big Jon";` is executed after `SET name = "Jono";` and thus we resolve to `Big Jon`.

SQLite is always a single-writer database, allowing just a single writer at a time for each database. PostgreSQL by default can have multiple writers but ultimately coordinates write access to the same resources (a combination of row-locking as opposed to database-locking and MVCC rules), effectively serialising the write requests. In both cases, a total order on conflicting write transactions is achieved simply due to the natural ordering of processing orchestrated by database locks.

### 1.2 Local-first applications

Local-first is a name given to apps that work entirely offline and independent of cloud services and maintain the source of truth for the app's state offline. Optionally, it can then synchronise state P2P or through web services. If you're unfamiliar with the specific benefits of local-first apps, I recommend reading [Ink and Switch's article on local-first software](https://www.inkandswitch.com/essay/local-first/).

There are many benefits gained by users particularly around data and app ownership and durability, privacy & security. For the builder there are tradeoffs as local-first apps can be considerably more difficult to build. Some problem spaces require a central authority by design, so local-first apps are not always an appropriate solution - e.g. traditional banking.

It is important to note that local-first apps differ from "offline-capable" apps. Apple Calendar can be used offline for considerable periods, however 1) you had to add an online account in the first place and 2) the server remains the source of truth making your local offline changes pending requests awaiting server confirmation.

Local-first inverts this, where the local device is the source of truth; i.e. has authoritative state. So if you have an app on your phone & laptop that can both go offline and still work and sync when possible, you now have multiple writers creating authoritative state, but unlike traditional RDBMS, without central coordination. This is where CRDTs come into play.

### 1.3 Conflict Free Replicated Data Types (CRDTs)

CRDTs are a family of data structures and their corresponding methods that allow you to combine incremental pieces of state together, received in any order, to converge on the exact same result. There are some very easy to understand CRDTs and there are complex CRDTs (usually handling lists & text). Underpinning both are a set of common mathematical properties based in set & order theory.

The G-Counter CRDT (or Grow-only Counter) is very simple and demonstrative. This CRDT provides a shared, monotonic (it can only go in one direction) counter. Each site maintains a set of counters starting with an empty set {}. Site A can record a count of 4 and add it to the set {A:4}, making the total count 4. It can then add 2 making it {A:6}. Site A can send its count to site B which already has {B:2}. Now Site B has both {A:6, B:2}, making the total count 8. Site B can then send both quantities back to site A. {A:6} would be ignored on site A because it's already there - max(6,6) is still 6. Now both sites have {A:6, B2}. As you can see the order of counts doesn't matter, and merging is idempotent (taking the max of each site's counter).

The G-Counter is a state-based CRDT. It is often useful to divide CRDTs into "state-based" and "operation-based" CRDTs, but the distinction can sometimes break down. A state-based CRDT can share the entire current state and operation-based CRDTs can share individual commands.

The G-Counter already reveals some of the underlying properties of CRDTs:
- Commutative (a ⊔ b = b ⊔ a): The order of application of the merge function does not matter e.g. `merge({A:6, B:2}) = merge({B:2, A:6})`
- Associative (a ⊔ b) ⊔ c = a ⊔ (b ⊔ c): Deceptively similar to commutativity but not quite. Associativity shows that a change in how operations are grouped (within the same total execution order). concat("hello", concat(" ", "world")) = concat("hello", " ", "world") is associative, but not commutative.
- Idempotent a ⊔ a = a: Merges can occur more than once on the same data without causing further effects. e.g. in our state-based g-counter, max(6,6) - the key mechanism of merging counters, is idempotent.

The proto set that holds these identities is a "Join-Semilattice" - a partially ordered set (Poset) that has a join (least upper bound). (TODO: BRUSH UP ON THIS)

I found [Marc Shapiro's talk at Microsoft](https://www.youtube.com/watch?v=oyUHd894w18) very helpful in understanding these properties and a Join-semilattice. He was one of the authors of the paper that formalised and named CRDTs and this talk was given around the same time. Marc talks about CRDTs as offering "strong, eventual consistency" - distinguishing it from the weaker guarantee of "eventual consistency". So "strong, eventual consistency" guarantees that once all state updates have been shared between n nodes, the state at all n nodes will be identical.

Looking at [Marc's papers](https://scholar.google.com/citations?hl=en&user=mqSQZ0EAAAAJ&view_op=list_works&sortby=pubdate) his background is firmly in distributed computing. Martin Kleppmann and his research company Ink and Switch has also researched CRDTs  in depth, as well as created the library "automerge" but has focused on their use in local-first applications.

## 2.0 Airday's CRDT design

## 2.1 The humble LWW-Register CRDT

```json
 {
   "timestamp": 1,
   "value": "Ernie",
 }
```

This is one of, if not the simplest CRDT. It stores a single value. It is conceptually similar to the single-server based concept instead of the server sequencing via recieve time, each writer i.e. clients sequences it via a timestamp they add on write. When another client receives an update, they compare the incoming timestamp to the existing timestamp. If the incoming timestamp is greater, they merge that data & timestamp. If the incoming timestamp is less than the existing timestamp, the incoming operation is discarded. If the incoming timestamp is the same, it will need to rely on a secondary deterministic order token.

You could use a LWW-Register to track an object, but you would have to write the entire object at every pass. This makes a lot of operations heavier - as you always have to pass around and write the entire object each update. What we will do instead is create a CRDT to track multiple attributes.

This class is the bones of an LWW Register CRDT, pedagogical only. Most egregiously, it has a bug on handling concurrent updates that makes its output depend on merge order - violating the C in CRDT. It lacks error handling for genuinely unavoidable conflicts (usually a systemic error), means of deleting, means of unsetting the value and does not track history or causation. Some of this can be added internally, some of this relies on the system that handles the CRDT.

```javascript
class LWWRegister<T> {
  timestamp: number;
  value: T;
  constructor(timestamp: number, value: T) {
    this.timestamp = 1;
    this.value = value;
  }
  merge(b: LWWRegister) {
    if (other.timestamp > this.timestamp) {
      return other;
    }
    return this;
  }
}

let a = new LWWRegister(1, 'Jonathan');
let b = new LWWRegister(2, 'Jon');

a.merge(b); // resolves to b
```

## 2.2 Operations vs State based
The LWW Register is best thought of as a state based CRDT, because you are replacing the entire state (or not at all) with each merge. The LWW Register Map as shown below is better thought of as an operation based CRDT but the line blurs somewhat in implementation as we will see.

## 2.3 Turning the LWW-Register CRDT into a map
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

It is a matter of framing if you think of these as a collection of discrete state-based CRDTs keyed by a string, or a single CRDT. We are simply running merge over each key/val discretely, the merge of each field starts and ends at that field.

However, because we are treating it like a single object that is meant to materialise into a single domain object, and we'll record history & do encryption on a partial group of LWW Registers, it's easier to refer to it as an operation based CRDT.

Libraries like YJS and Automerge use "documents" as their primary entrypoint. The "CRDT" nomenclature is more an implementation detail.

## 2.2 Timestamps, incl. clock skew / HLCs

2 people updating an event’s start time:
- Today @ 3:54pm local time: Update start time to 2:00pm: (client a, 4)
- Today @ 5:55pm local time: Update start time to 2:30pm: (client b, 1)

Final merged result:
{
	start_time: {
		value: utc_timestamp of 2:30pm,
		lww_timestamp: HLC (milliseconds + ticks),
	},
}

HLC is good esp. in an E2EE context. We have to trust client's clocks. Worst case incl. when a client's clock is really far ahead and so wins everything, this is where the monotonic part kicks in. For this particular piece of context, the absolute worst that could happen here is that the client would fake old or new clocks. Old clocks could alter the history to seem unlikely or impossible. New clocks could alter the history to be impossibly positioned in the future in comparison to local clock. At worst - clocks could occupy positions towards the end of the possible range of integers - for this reason we can have our clients ignore operations with LWW timestamps that are a little too forward or backward - that can even change over time.

In general all our devices should eventually resolve with NTP. If NTP is broken we have bigger problems.

We could make some kind of monotonic single integer clock in millisecond or microsecond resolution but you open yourself up to clock skew for many repeated events (e.g. mass clock creations when you import data) - obvs. more noticeable on a millisecond res clock.

BigInt vs 53-bit integers
We need perfectly comparable timestamps across web & other platforms. For ease of use, if they can fit into a 53-bit int thus in a 64 bit floating point (Native JS Number) this is the easiest way to go.

For a tie breaker, we can use the (actor, counter) tuple.

## TODO, maybe: Analyzing the offline for 3 months problem (?) / clock skew problems

## 2.3 Delete & Tombstones

This is where you may have to bring in OR-Set - i.e if your individual is part of a set. As I'm going with a many small documents architecture, my OR-set is more implicit over the major project collection. This allows me to keep the entire history on the server but tombstones can be compressed on clients.

## 3 CRDT Synchronisation

### 3.0 SyncObjects & SyncOps

I usually think of the CRDT as the live, in-memory, data structure along with its merge rules. But usually we don't create a "CRDT" to send between devices. We send operations that are later merged together using a known algorithm.

In my app, I do not have a separate data structure for each in my case as they are effectively the same thing, but I do have different parents `SyncObject` housing & tracking the live object and `SyncOp` which is intended to capture and serialise an opration.

## 3.1 Snapshots

Snapshots (or checkpoints) can be created to skip over the delivery of all operations and subsequent merges. We can allow trusted clients to take all seen operations on an object, merge the result into a serialisable snapshot which can then be synchronised with other clients.

With an LWW-Register, snapshots are pretty simple. They are pretty much identical to normal operations. When you receive a snapshot and only a snapshot, you forgo history, but you get to the most up-to-date state immediately. Depending on your app's needs, you can send only the snapshot, the snapshot first or only send operations.

In an E2EE context, we have no way to verify if the snapshot's integrity. Clients can send any junk and call it a legit snapshot. Incorrect snapshots will stick out if full operation history is available and you could even handle an incorrect snapshot as an error - you can test it against the full history - but this defies the point of a snapshot.

## 3.2 Identifiers

`(actor, counter)`

(actor, counter) on our operations themselves provides an addressable history so that we can make version vectors work. They also allow for a partial ordering of all operations on each actor.

A UUID could work but we lose per actor per document partial ordering so we can't rely on version vectors.

Where do we get the actor from? You would generally tie it to the device, which can only publish one update concurrently, unlike a single account. The actor could use an arbitrary UUID, or it could derive bytes from the public encryption key.

## Snapshots & compaction

Compaction implies removal of history, so you need to decide if this is acceptable or not. For Airday, I allow clients to catch up quickly

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

Introducing a DAG through hashes on object metadata could replace VVs as well IDs and allow for more solid integrity checks and better evidence of causal tampering. I felt that this was going too far.

This is an alternative to Version Vectors & creates a stronger "happens-before" claim that takes the last hash or set of hashes, the "heads" and also computes a new hash. The hashes are both addressable and can be used to verify the causal claims. You could theoretically still tamper with this by selectively choosing older hashes, for example, or a set of hashes that don't quite make sense, but it is more tamper-evident.


## End-to-end Encryption

I won't go over exactly how I achieved end to end encryption here, but I will go into a couple caveats.

The threat/trust model is totally changed. Server validation does not exist. Clients can send literal junk without server awareness. So we're moving from a centralised server is the data arbiter, to where the clients are. The sync itself could be P2P or through a stable relay node aka server.

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


## Existing libraries
There are several CRDT libraries around like:
- Automerge
- YJS
- Loro
- Cola

If you want list or text you probably want one of these.


The drawbacks of a single trusted actor model you have a single point of failure, throughput is limited by a single machine & its available bandwidth and latency is fundamentally limited by proximity to the single node. So while you gain simplicity you lose availability.

To increase availability, we can clone the store and place copies closer to potential clients (on a CDN, on a database replica, on a phone, etc).

Synchronisation is when two spatially separate things, to an independent observer, appear the same. Synchronised swimming is an easy way to understand this. Two people are next to each other in the water but they are doing the same things at the same time. You can focus on one and reasonably expect that the other will be doing the same thing - that is at any one time their state is consistent. So proper synchronisation delivers consistency across nodes.

CAP Theorem shows that a distributed data store must make sacrifice one of Consistency, Availability and Partition Tolerance. This is a useful framework to consider when making decisions in distributed systems. CRDTs give us a formalised means of building strong, eventual consistency. It is important to note too that you can not use CRDTs everywhere.
