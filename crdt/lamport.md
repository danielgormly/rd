# Lamport timestamps

> From paper: Time, Clocks, and the Ordering of Events in a Distributed System, 1978

## Abstract

Happened-before ordering defines a partial order of events in a distributed system. Total order can be resolved by synchronising a system of logical clocks. Relevant in any case where a system's message transmission speed is not negligible compared to processing speed. This paper mostly deals with discrete, spatially separate nodes, but notes that the problem applies to single nodes. Real, physical clocks can be used in conjunction with the algorithm to prevent differences between user perception and algorithmic outcome.

## Partial ordering
Establishing a happens-before relationships requires events to be observable. Distinct physical clocks alone must be considered out-of-sync for the purposes of reliably creating a happens-before relation, so the relation must be defined without a wall clock.

Each singular process has a stream of events that a priori, constitute a total order.

The happens-before relation "->" is defined as so:
1. If a & b are on the same process, and a is observed before b, a -> b
2. If a is sending one message & b is the receipt of the same message on another process, a -> b
3. If a -> b & b -> c then a -> b.
4. Events are concurrent if a -/> b & b -/> a.

Assumption is that a -/> a for any event a - irreflexive partial ordering.

For system correctness, we don't acknowledge all causal plausibilities, only those we can verify.

## Logical clocks
Let's assign numbers to events. We define a clock C1(a) to process P1 where a is an event a.
For any event a -> b, C(a) < C(b). The converse is not necessarily true, as not all concurrent events have the same C. Thus C(a) < C(b) does not necessarily mean that a -> b.

The Clock Condition holds if two conditions are satisfied:
1. In the same process, a -> b, C(a) < C(b)
2. In message->response pairs, a -> b, C(a) < C(b)

To fulfill these conditions,
1. for successive events, including sending messages in process p1, increment our clock
2. when receiving events, increment clock to greater or equal than present value AND greater than T(m) from send message

## Total order

To break ties in the above logical clock system, ≺. Precisely, that means
a => b iff C(a) < C(b) OR C(a) == C(b) AND Pi ≺ Pj.

## Example algorithm
A resource scheduling algorithm is described using the above Clock where a group of processes synchronise queue states to build a shared total order amongst all nodes with the purpose of allowing a single process to request a resource - granted it has requested the resource before all others (in total message order). The algorithm requires all nodes to be active, otherwise the system halts to a dead state.

## Anomalous behaviour
We can have non-timestamped events that can be observed as part of the causal chain in which timestamped events occur in a distributed system, that do not concur with the timestamp sequences within the system.

A strong clock condition would hold here.

## Physical clocks
So this part is more difficult but basically it shows that we can engineer solutions that attempt to maintain certain conditions that once maintained can guarantee that causally succeeding events will take on a later physical timestamp. It describes clock sync in distributed systems basically.

## In summary

This paper was about causal ordering which can provide a partial order, introducing total ordering through a tie breaker, demonstrating a mutex algo based on that total ordering system, then finally introducing a general purpose physical clock that respects the same mechanism but that if certain conditions are met (can be difficult to obtain), guarantees monotonic timestamps across causal boundaries.
