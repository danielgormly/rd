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
