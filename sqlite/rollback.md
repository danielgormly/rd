# Transactions, Rollbacks, Atomicity & options for Sqlite
https://sqlite.org/atomiccommit.html

## Atomicity

Atomicity provides all or nothing guarantees for instruction sequences. This allows you to ensure the database does not end up in in-between states thus all states are valid, provided you programmed well. Whilst its impossible to write various and potentially large and diverse changes instantaneously, the atomic logic makes it appear that this is the case, holding true even in the case of a power failure.

Atomic guarantees work differently in "rollback mode" vs "WAL" mode

## Rollback mode
Interface between a computer and drive, from the DB's pov which does not implement any or many direct drive access, instead relying on fsync calls, has a minimum sector size for reads, which can be separate for writes. This primarily concerns minimum write sector.

Underlying hardware was typically accessed via sectors or blocks at a time, though modern NVMes change this with direct single register access.

Sqlite is tuned for 512 byte sectors - though recent implementations have provided a var for embedded device manufacturers to change this as needed. Neither Unix nor Windows provides a means to interrogate the device sector size directly. For context the standard sector of many drives is increasing from 512 bytes to 4096 bytes.

Sqlite assumes that writes are not guaranteed until `fsync` and `flush` have been called - the OS can reorder or buffer write calls. This assumption is the best assumption it can make within the VFS - but it is not necessarily true.

Sqlite assumes that when a file grows in length, the new space contains garbage until written; that is the file-size may change prior to writing.

Sqlite assumes file deletion is atomic, so that without receiving an ack, either the file is deleted or not deleted. A partial delete may corrupt the database. Sqlite also does not have any special protection or recovery mechanisms against hardware level degradation etc, driver flaws etc. Powersafe overwrite is assumed too; that writes on one range of bytes will not affect a range elsewhere.

## Single File Commit

Sql writes must first read the schema to validate the incoming instruction and plan its actions. Writing will incur a shared lock on the entire DB i.e. many reads, but no writes while lock is pending; necessary condition to guarantee atomicity. Locks are applied via the OS disk cache, not the disk itself, so it usually amounts to a flag on a file.

After the shared lock is acquired, reads can be made, and fulfilled by either or both of the disk cache and the disk. The db file is read by pages.

A reserved lock is obtained, which can only be obtained once at a time i.e. in normal operations, it is only possible to have one concurrent writer. (Shared read locks are still allowed at this time). It does signal however, that no other processes should start reading at this time, and that the db is awaiting other read processes to end.

Then the db *creates* a journal rollback file, which is supposed to contain the original contents that will be written over, so that it can rollback to that state.

The writes then occur in user space buffers, which can only be seen at this time, by that connection.

Now it's time for a 2x flush. Flush one writes out the rollback journal content. The head of the rollback journal is then modified to show new page count. Then the header is flushed to disk.

Ready to obtain exclusive lock by first obtaining a pending lock and upgrading to an exclusive lock. A pending lock DOES prevent new readers from obtaining new shared locks. When all shared locks a clear the exclusive lock is obtained.

We are finally ready to write the data, then call an explicit flush. Together with writing the journal rollback file, these are the key bottlenecks in transactions.

Time to delete the journal rollback file. Once deleted, and although this is not atomic from the user perspective it is, this means that the recovery processes will not see it, and thus the transaction is certainly committed. SQL can be configured to truncate the rollback file to 0 size, this give a null/0 opening byte that when read, is effectively considered deleted.

The exclusive lock is then released.

tl;dr:
1. Obtain shared read lock
2. Read relevant pages, likely hitting OS disc cache (OS buffer) or schema reads, and transferring to userspace.
3. Obtains reserved lock, wait for reads to end.
4. Write existing contents to be overwritten to the journal rollback file
5. Write changes in user space cache
6. Flush the rollback journal
7. Obtain pending lock, starve shared locks & upgrade to an exclusive lock.
8. Write changes to db file (usually they will only make it to disk cache)
9. Time to delete the journal rollback file. This is the true commit.
10. Exclusive lock released.

## Rollbacks
Rollbacks are pretty simple conceptually, if the journal is there and hot, roll it back, flush and delte the journal.

## Multi-file commit
This section explains multi-file commits. This is beyond my present interests.

## Additional details of the commit process
- All other pages within a sector must be stored in the rollback journal to avoid potential corruption. The entirety of all affected sectors need to be considered as suspect - this would appear to be hardware level concerns.

## FULL vs NORMAL synchronous pragma
FULL = Flushes journal twice as described + (redundant) CRC per page
NORMAL = Single flush, CRC only

Thus in normal mode, the header which contains page count of journal, flushed together with the journal data, could lead to attempting read on a garbage journal, if the page count say is written before the journal finishes writing.

In full mode the count, besides being flushed separately, is stored in a different sector.

## Cache spillage
These assume db changes fit in memory in user cache. For larger changes, the rollback journal is flushed to disk, an exclusive lock is acquired and changes are written into db as is normal, however, this will repeat if the cache was spilled, with new journal headers appended for each spill, until it no longer spills and can finally delete the log.

## Optimisations
- counter to track txes to reduce re-reads of same data between txes
- exclusive access mode: only one process can access - simplifies the commit phase in several ways as it is guaranteed only one connection
- free leaf pages (pages that contain deleted data) do not get added to rollback journal
- etc
