NOTE: This is a very early synchronisation plan / blog post that I am now replacing.


---
title: 'Building local-first, e2ee, collaborative sync'
description: 'Airday build note'
pubDate: 'Aug 30 2025'
---

<hr style="max-width: initial" />

Airday is a local-first, privacy respecting reminders/calendar/tasks app I'm building.

I want a simple, very low footprint, very fast, cross-platform, low-dependency, e2ee local-first sync engine that is robust & that I can easily reason about.

The promise of CRDTs is that you don't need to deal with insane distributed systems algorithms; skipping CAP. The tradeoffs is that in the process of moving conflict resolution into the data structure, you usually end up with more data, your empower clients that you don't have control over and especially when you're E2EE - you allow clients to add bad data into the database. You need to protect against faulty clients and malicious clients. You also need to build resiliency against mismatched server/client combos in either direction (forward & back compatibility). Ideally, you only invite high trust clients into your domain.

## Evaluation of what's out there

I thought this would be easier to build than it was, so I didn't really do my due diligence before I started but I will do a little bit now:

- TODO: TABLE

## How does Airday sync stack up?


## High-level

Airday's version 1.0.0 needs to sync 3 main resources across clients & servers to eventually coincide on the exact same data across 3 main resources:

- Libraries (like workspaces, personal and shared)
- Lists (to categorise items)
- Items (like tasks)

All clients should be able to create libraries, lists & items whether they're offline or online. Let's start near the bottom and work our way up.

## LWW-Registers
This is the fundamental building block of sync. It is a very simple CRDT. In essence it is a timestamp + a piece of data, with a few extra details to ensure everything works together.

```javascript
LWWRegister {
  timestamp: {
    utc: number,
    pid: number,
  },
  data: any,
  // We will go into comparison details later
  fn merge(other: LWWRegister) {
    if (other.timestamp > this.timestamp) {
      return other;
    }
  }
}
```

Let's say you have 2 clients A & B. cA produces an item where text="hello", then cB update that item witth text="goodbye", generating a newer timestamp, after exchanging updates, in any order, through any client that implements the merge correctly, all clients converge on item.text="goodbye".

Merge operations are *idempotent* across all updates - meaning that our system doesn't care about how many times they were applied. They are also *commutative*, meaning that the final outcome is the same, given the same set of inputs - the order of application does not matter.

Practically speaking, this means messages can arrive out of order, and multiple times, and still converge on the same value. This is *strong eventual consistency*. Consensus is built into the combination of data & merge ops, rather than trying to serialise it through a single actor.

## Timestamps

I chose to implement a client-side composite timestamp consists of two pieces of data - `utc` & `pid`.

`utc` is an absolute client timestamp, `pid` is an arbitrary identifier created per session. Our system requires comparison absolute, discrete timestamps to make a decision about which data to keep and which to throw away during a merge operation. `utc` gives us the ballpark time, `pid` gives us a tie-breaker.

`utc` is a client-generated, monotonic (aka always increasing on each client), 53-bit integer representing microseconds passed since unix epoch.

Firstly, I chose microsecond resolution to reduce the effect of time dilation. Monotonicity means that every timestamp generated on each device ticks up timestamp by 1 unit. If I generate 100 sync changes in code at once on a unix timestamp measure in millseconds, each update will be 1 millisecond apart, so it looks like this took a lot longer than it did! Microseconds diminishes this effect by a factor of 1000.

While Javascript does provide a `bigint` type, for simplicity's sake, I want to be able to store the JavaScript `number` type - float 64. You can safely fit 53-bit integers into a float 64 before precision is lost. This is because the remaining bits are used to store signs and multipliers (mantessa). (Try typing `Number.MAX_SAFE_INTEGER` in your web console - actually I've done it for you just check your console). A microsecond is 1/1000 of a millisecond. A unix timestamp represents time measured in milliseconds elapsed since the Unix epoch (the first millisecond of 1970). I am however using microseconds. 53 bits of integer gives us `2^53-1 = 9 007 199 254 740 991` aka Number.MAX_SAFE_INTEGER. Divide that by `(1000 * 1000 * 60 * 60 * 24 * 365)` to see that you have 285 years worth of microseconds in that integer. So you have a range of 285 years to work with. More accurately, put `new Date(Number.MAX_SAFE_INTEGER / 1000)` into a JS console and you get `2255-06-05T23:47:34.740Z`. So I have until the year 2255 to change my storage type before this sync engine breaks.

The pid is also a 53-bit integer, but with arbitrary precision. It is feasible that 2 clients can produce the same microsecond value, so we need to introduce this as a tie-breaker. In keeping with our local-first promise and keeping things simple, we generate it on the client.

Pid collisions are possible, but very unlikely. Pid collisions AND microsecond collissions are even less possible. A genuine collision would cause the merge to arbitrarily pick one or the other, leading to an inconsistent eventual merge. It is also an even that can be detected and logged (same timestamp, different data).

TODO: Clean up the mathematics (Birthday paradox formula, P ≈ n² / (2 × N))
```
P ≈ 100² / (2 × 9,007,199,254,740,991)
P ≈ 10,000 / 18,014,398,509,481,982
P ≈ 0.0000000000005553 = 5.553 × 10^-13
i.e. 0.00000000005553% chance of collision
```

## LWW-Element-Set
We can extend the LWW-Register with tombstones to form an element set. Tombstones are a simply a marker that an element should no longer exist. The existence of an element shows that it should exist. We don't need complex timestamps around this, because these are both immutable values. Once they exist they exist forever... well there are models for tombstone compaction but I haven't implemented them yet.

## Transport

Flatbuffers over WS (honestly i haven't done my due diligence over perf+size over say just compressed json, but i do like multiple language generation + strong typings)

## Anatomy an item
```javascript
{
  // Immutable props (set once)
  id: uuidv4(),
  libraryId: uuidv4(),
  // Mutable props
  attributes: {
    text?: LWWRegister<string>();
    completed?: LWWRegister<boolean>();
    // etc
  }
  // Server generated metadata
  server_timestamp: xyz,
}
```

## Server-side persistence
For the community version of Airday, intended to be self-hosted, I'm using Sqlite. To merge & persist on the server, I begin a transaction, select the item, build the item and its lww-registers, compare against the incoming lww-registers, and finally reinsert the item.

This introduces the possibility of a comparison against stale data. If 2 merges are happening simultaneously, both merges would compare against the existing db data instead of each other, potentially causing earlier timestamps in one parallel transaction, to win over later timestamp. In other words, the later timestamp never figures into the CRDT transaction.

To deal with this, we simply add a monotonic server timestamp and make sure that we are updating against the same untouched data we read from.

TODO: Code

## 2-phase commit & client-side optimism
The fundamental object is the SyncOp object i.e. Sync Operation. Each SyncOp has an OpKind: `SNAPSHOT`, `PATCH` & `DELETE`.

Phase 1 writes to the client optimistically
Phase 2 writes remotely. Writes CAN be rejected under certain circumstances.

## Client-side web-app persistence
This is the same more or less but I'm putting them in with indexeddb. Currently I'm not using a worker or anything like that for storage or merging. I'm also currently keeping all items in memory, all the time, so I only need to write, rather than read.

## Sync process
Describe the full sync negotiation

## Verification tree
Something could go wrong that causes a client database to drift from the server database. While I have built-in lots of features to avoid it, missing messages & corrupted local databases can always pop up. Strong eventual consistency is pointless, if items in the server & client never even meet!

Merkel tree's a great tool for the job

Buuut for v1 I'm going for simplicity and accepting some trade-offs. I decided to build a checksum tree based on XORing server timestamps for each day period.

## Pull
- client pull = client asks for updates per resource since gte last server timestamp seen, receives count + batches of items

## Push
- client push new = gen item with client side with immutable id = uuid v4 + library id (the shared or private workspace id), mutable attributes are all lww-registers (simple crdt

## Addendum 1: Item ordering
TODO: Mention crdt-based sets with ordering vs fractional indexing (hint i've chosen the latter)

## Addendum 2: CalDAV tasks?

CalDAV is not simple, I can't e2e encrypt fields without proxying through etcsync. It has a bunch of features I don't care about and lacks things I do for this app. I'd have to proxy it to get it to work through web. It's not designed to go so fast.

However I do want to build an adapter so people can use their platform native calendar app to see events. Problem for another time.

- todo: notes on naughty clients with future timestamps



Example timeline

action | last sync | last modified | inflight
-----------------------------------------------------
create | NULL      | A=NOW         | NULL
sync   | NULL      | A             | B=NOW
edit   | NULL      | C=NOW         | B
ack    | B         | C             | NULL
sync   | B         | C             | NOW

In this example there's an immediate retrigger after ack as edits were made while last sync was in flight

A remote create could start off with both last sync & last modified = NULL || NOW. The effect is the same, as no local modifications are present. it might be better to have them equal.

I don't need to save in-flight data to local cache - i just assume it failed. So I load last sync + last modified for all items - I could index this, but honestly seeing as I have to load all items anyway, I can just compute them on load. If i'm NOT loading all historical items (which is a wise decision, then maybe an index is worth it)
