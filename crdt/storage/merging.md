## Lost update problem

Initial state: Item 500 has timestamp 1000

TX1 (Client A):
1. Reads item 500: timestamp=1000, data="old"
2. Incoming change: timestamp=2000, data="A wins"
3. Merge decision: 2000 > 1000 ✓ → Will update

TX2 (Client B) - SIMULTANEOUS:
1. Reads item 500: timestamp=1000, data="old" (same stale data!)
2. Incoming change: timestamp=1500, data="B wins"
3. Merge decision: 1500 > 1000 ✓ → Will update (WRONG!)

Execution order:
TX1 commits first → Item 500 now has timestamp=2000
TX2 commits second → Overwrites with timestamp=1500

RESULT: Item 500 has timestamp=1500, but should have 2000!
The later timestamp (2000) was lost due to stale read.

While this theoretically could correct itself, it's not ideal.

In SQLite this is ok I believe due to db level locking.

However with Postgres, we would probably need to SELECT FOR UPDATE (may be simplest), use REPEATABLE READ (i.e. 100% serializable trxs) or: application level changes including timestamps in query to test they are correct (one  attribute at a time per query - still fine just potentially slower)

my use case for batching is like moving 1000 items from one list to another, better ux is to apply these all at once or nothing, because if users receive a half successful move... they might see it as a mistake and try to roll it back manually, or do something else weird, in which the other half will later succeed

i think i will kill arbitrary batching in favour of domain-specific batching
