# WAL, Atomicity & options for Sqlite
// https://sqlite.org/wal.html

## They're illusions

Atomicity is all or nothing for pending transactions. This allows you to ensure the database does not end up in in-between states thus all states are valid, provided you programmed well. Whilst its impossible to write various and potentially large and diverse changes instantaneously, the atomic logic gives it such qualities that it seems like this is the case for observers. This is true even in the case of a power failure.

## Atomic mechanics are different in WAL vs Non-WAL
