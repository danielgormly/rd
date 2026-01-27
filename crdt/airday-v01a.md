## LWW-Register Map V2

The goal of DiY Crdt is to have a minimal footprint for the purposes of this app and understand guarantees & limitations fully.

- Device ID + signature verification = ensures authenticity
- Timestamps (based on wall_time + op_id as tie breaker)
- DAG via parent hashing = verification of causality, explicit confirmation of what ops are claimed to have been seen in subsequent ops, which allows gating merges until parents have been seen

## Ordering/Clock
- total ordering determined by: (wall_time, device_id)
- wall_time: clock - per device monotonic i64 microseconds, loaded on client from last number
- We are dropping logical clocks as causal order (when not compacted) can be determined through DAG
- TODO: Consider server protection against both stale & future timestamps.

## Op Id
- Op id enables idempotent replay (can be played back multiple times to same effect), deduplication & precise dag refs

## Register
- Registers are typed flatbuffers each with a hcl

## Tombstone / Deletion
- All values must be nullable

## Schema versioning
- Forward compatibility
- Migration paths
- Types

## Merkle DAG for HEAD refs
- merkle root of known state
- Efficient consistency checks
- Reduces payload size as history grows

## Signature specifics
- Sign(sk, hash(canonical_update_bytes))
- canonical_update_bytes: these are ?

## Encryption
- TODO

## Compaction/Compliance (we will call it compliance mode)
- Compliance is by default OFF, Compaction is by default ON
- Compaction can be turned off for *extra validity*

## Snapshot mechanics
- Snapshots to occur after an operation has been committed & seq returned, right?

## Schema enforcement


enum OpType {
  Patch,
  Snapshot
}

type OperationId = (actor_id, ctr);

struct Operation {
  op_id: OperationId,
  doc_id: UUID,
  type: OpType,
  sig: sig over (header incl dot + payload_hash + hash(ciphertext)),
  ciphertext: bytes
  parents: Vec<OperationId>,
  payload_enc: Vec<u8>,
}

struct LWWRegister<type> {
  wall_time: u64,
  actor_id: u64,
  payload: type,
  null: boolean,
}

// Example
struct CalendarEvent {
  title: LWWRegister<String>,
  utc_time: LWWRegister<Number>,
  tz_offset: LWWRegister<Number>,
}
