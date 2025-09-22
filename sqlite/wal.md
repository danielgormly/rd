# WAL mode in Sqlite
https://sqlite.org/wal.html

The default mode is "rollback" mode. However, when WAL mode is used, the mechanics and guarantees change.

WAL advantages:
1. Significantly faster in most scenarios
2. More concurrency as readers do not block writers, writer does not readers. They can proceed concurrently.
3. Disk I/O operations tend to be more sequential (?)
4. WAL uses many fewer fsync() operations and is thus lesss vulnerable to problems on systems where the fsync() sys call is broken

Disadvantages:
1. WAL does not work over a network fs as there is a shared memory requirement
2. DBs with ATTACHed dbs are not atomic across all DBs, only individuals
3. You cannot change the page size after entering WAL mode.
4. (this one was no longer relevant but wanted to map numbers)
5. WAL slightly slower (1-2%) on low write dbs
6. Uses additional files! (wal & shm files)
7. Extra operation of checkpointing

## How WAL works
Inversion of rollback mode. The original content is preserved in the db file and the changes are appended into a WAL. A commit occurs when a special record inidicating a commit is appended to the WAL. Commits can happen without ever writing to the OG db.

## 2.2 Concurrency
For read operations, the location of last valid commit, the "end mark" is remembered. Between various txes, this could be a different point as the WAL grows concurrently.

Readers first check the WAL (prior to their end mark) for the page they are reading, and will return that if found, or do a db read.

An in-memory wal-index is maintained helping this happen more quickly.

Writers append new content to the end of the wal, and there can only be one writer at a time.

## Checkpointing
Writing from WAL to the original database is called "checkpointing". Checkpointing can run concurrently with readers.

By default after reaching SQLITE_DEFAULT_WAL_AUTOCHECKPOINT compile time option (default size = 1000) pages, checkpointing happens automatically.

Checkpointing cannot happen on pages that cannot yet be seen by any current reader i.e. the pages exist in the wal beyond the reader's end mark. The reason for this, is bc that may override a reader's view.

If the WAL is transferred into the db and synced and no readers are using it, the WAL can be rewound.

## Performance

Writers only have to write data once in WAL mode (WAL checkpoint is done asynchronously).

Writers sync WAL on every transaction commit if PRAGMA synchronous = SQLITE_DEFAULT_WAL_AUTOCHECKPOINT, they do not if PRAGMA is set to NORMAL.

WAL can be relatively expensive to read if the WAL is big, as pages needs to be interrogated whether they exist in the WAL or not.

SO for my use case

WAL is the way to go. synchronous = NORMAL is the way to go if I account for the low possibility of rollbacks after commit in my merkle (or similar) resolution.
