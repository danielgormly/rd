// Comparison between storing LWW-Register attributes as JSON vs full columns (potentially vs EAV too)
// Testing performance, file size, ergonomics, flexibility

import { Database } from "bun:sqlite";
import { globalTSProducer, LWWRegister, LWWTimestamp } from "./lww";

const db = new Database(":memory:");

interface Item {
  workspace_id: number;
  id: string;
  text: LWWRegister<string>;
  completed: LWWRegister<boolean>;
  updated_utc: number;
}

let items: Item[] = [];
for (let i = 0; i < 100000; i++) {
  const ts = globalTSProducer.timestamp();
  items.push({
    workspace_id: 1,
    id: crypto.randomUUID(),
    text: new LWWRegister<string>({ data: "hello" }),
    completed: new LWWRegister<boolean>({ data: true }),
    updated_utc: Date.now(),
  });
}

function colStrategy() {
  const setup = db.query(`
    CREATE TABLE IF NOT EXISTS item (
      -- static vals
      workspace_id UUID NOT NULL,
      id UUID NOT NULL PRIMARY KEY,
      -- dynamic vals
      text TEXT NOT NULL,
      text_utc INTEGER NOT NULL DEFAULT 0,
      text_pid INTEGER NOT NULL DEFAULT 0,
      --
      completed BOOLEAN NOT NULL,
      completed_utc INTEGER NOT NULL DEFAULT 0,
      completed_pid INTEGER NOT NULL DEFAULT 0,
      --
      updated_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);

  // set up tables
  setup.run();

  // bulk insert
  const insert = db.query(`
    INSERT INTO item (
      workspace_id, id, text, text_utc, text_pid,
      completed, completed_utc, completed_pid, updated_utc
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  const insertMany = db.transaction((items: Item[]) => {
    for (const item of items) {
      const sq = insert.run(
        item.workspace_id,
        item.id,
        item.text.data,
        item.text.timestamp.utc,
        item.text.timestamp.pid,
        item.completed.data,
        item.completed.timestamp.utc,
        item.completed.timestamp.pid,
        item.updated_utc,
      );
    }
  });
  insertMany(items);
}

const start = performance.now();
colStrategy();
const end = performance.now();
const duration = end - start;
console.log(duration);

function jsonStrategy() {
  const setup = db.query(`
    CREATE TABLE IF NOT EXISTS json_item (
      -- static vals
      workspace_id UUID NOT NULL,
      id UUID NOT NULL PRIMARY KEY,
      -- dynamic vals
      attributes TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(attributes) AND json_type(attributes) = 'object'),
      updated_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);

  setup.run();

  // bulk insert
  const insert = db.query(`
     INSERT INTO json_item (
       workspace_id, id, attributes, updated_utc
     ) VALUES (?, ?, ?, ?)`);

  const insertMany = db.transaction((items: Item[]) => {
    for (const item of items) {
      const attributes = JSON.stringify({
        text: {
          data: item.text.data,
          utc: item.text.timestamp.utc,
          pid: item.text.timestamp.pid,
        },
        completed: {
          data: item.completed.data,
          utc: item.completed.timestamp.utc,
          pid: item.completed.timestamp.pid,
        },
      });

      insert.run(item.workspace_id, item.id, attributes, item.updated_utc);
    }
  });

  // Actually execute the transaction
  insertMany(items);
}

const start2 = performance.now();
jsonStrategy();
const end2 = performance.now();
const duration2 = end2 - start2;
console.log(duration2);

// Proper LWW merge using application-level merge logic
function properLWWMergeBenchmark() {
  console.log("\n=== Proper LWW Merge Benchmark ===");

  // Simulate incoming changes from client - some will win, some will lose
  const incomingChanges = items.map((item, index) => {
    // Mix of timestamps - some newer, some older than existing
    const timestampOffset = index % 5 === 0 ? -1000 : 1000; // 1/5 will be older (lose merge)

    return {
      id: item.id,
      text: new LWWRegister({
        data: `updated text ${index}`,
        timestamp: new LWWTimestamp({
          utc: item.text.timestamp.utc + timestampOffset,
          pid: item.text.timestamp.pid, // Same PID to test UTC comparison
        }),
      }),
      completed: new LWWRegister({
        data: index % 2 === 0, // Mix of true/false
        timestamp: new LWWTimestamp({
          utc: item.completed.timestamp.utc + timestampOffset,
          pid: item.completed.timestamp.pid + 1, // Different PID to test PID comparison
        }),
      }),
    };
  });

  // Column strategy - read then merge then write
  const colStart = performance.now();

  const colReadQuery = db.prepare(`
    SELECT id, text, text_utc, text_pid, completed, completed_utc, completed_pid
    FROM item WHERE id = ?
  `);

  const colUpdateQuery = db.prepare(`
    UPDATE item
    SET text = ?, text_utc = ?, text_pid = ?,
        completed = ?, completed_utc = ?, completed_pid = ?,
        updated_utc = ?
    WHERE id = ?
  `);

  const colMergeTransaction = db.transaction(
    (changes: typeof incomingChanges) => {
      let mergeWins = 0;
      for (const change of changes) {
        // Read current state
        const current = colReadQuery.get(change.id) as any;
        if (!current) continue;

        // Reconstruct LWW registers
        const currentText = new LWWRegister({
          data: current.text,
          timestamp: new LWWTimestamp({
            utc: current.text_utc,
            pid: current.text_pid,
          }),
        });

        const currentCompleted = new LWWRegister({
          data: current.completed,
          timestamp: new LWWTimestamp({
            utc: current.completed_utc,
            pid: current.completed_pid,
          }),
        });

        // Perform proper LWW merge
        const mergedText = currentText.merge(change.text);
        const mergedCompleted = currentCompleted.merge(change.completed);

        // Check if anything actually changed (merge won)
        if (
          mergedText !== currentText ||
          mergedCompleted !== currentCompleted
        ) {
          mergeWins++;
          // Write back merged state
          colUpdateQuery.run(
            mergedText.data,
            mergedText.timestamp.utc,
            mergedText.timestamp.pid,
            mergedCompleted.data,
            mergedCompleted.timestamp.utc,
            mergedCompleted.timestamp.pid,
            Date.now(),
            change.id,
          );
        }
      }
      return mergeWins;
    },
  );

  const colMergeWins = colMergeTransaction(incomingChanges);
  const colEnd = performance.now();

  // JSON strategy - read then merge then write
  const jsonStart = performance.now();

  const jsonReadQuery = db.prepare(`
    SELECT id, attributes FROM json_item WHERE id = ?
  `);

  const jsonUpdateQuery = db.prepare(`
    UPDATE json_item
    SET attributes = ?, updated_utc = ?
    WHERE id = ?
  `);

  const jsonMergeTransaction = db.transaction(
    (changes: typeof incomingChanges) => {
      let mergeWins = 0;
      for (const change of changes) {
        // Read current state
        const current = jsonReadQuery.get(change.id) as any;
        if (!current) continue;

        // Parse JSON attributes
        const attrs = JSON.parse(current.attributes);

        // Reconstruct LWW registers
        const currentText = new LWWRegister({
          data: attrs.text.data,
          timestamp: new LWWTimestamp({
            utc: attrs.text.utc,
            pid: attrs.text.pid,
          }),
        });

        const currentCompleted = new LWWRegister({
          data: attrs.completed.data,
          timestamp: new LWWTimestamp({
            utc: attrs.completed.utc,
            pid: attrs.completed.pid,
          }),
        });

        // Perform proper LWW merge
        const mergedText = currentText.merge(change.text);
        const mergedCompleted = currentCompleted.merge(change.completed);

        // Check if anything actually changed (merge won)
        if (
          mergedText !== currentText ||
          mergedCompleted !== currentCompleted
        ) {
          mergeWins++;
          // Serialize merged state back to JSON
          const newAttributes = JSON.stringify({
            text: {
              data: mergedText.data,
              utc: mergedText.timestamp.utc,
              pid: mergedText.timestamp.pid,
            },
            completed: {
              data: mergedCompleted.data,
              utc: mergedCompleted.timestamp.utc,
              pid: mergedCompleted.timestamp.pid,
            },
          });

          // Write back merged state
          jsonUpdateQuery.run(newAttributes, Date.now(), change.id);
        }
      }
      return mergeWins;
    },
  );

  const jsonMergeWins = jsonMergeTransaction(incomingChanges);
  const jsonEnd = performance.now();

  console.log(
    `Column merge: ${(colEnd - colStart).toFixed(3)}ms (${colMergeWins} merge wins)`,
  );
  console.log(
    `JSON merge: ${(jsonEnd - jsonStart).toFixed(3)}ms (${jsonMergeWins} merge wins)`,
  );

  // Verify same number of merge wins (correctness check)
  if (colMergeWins !== jsonMergeWins) {
    console.warn(
      `⚠️  Different merge results! Col: ${colMergeWins}, JSON: ${jsonMergeWins}`,
    );
  }
}

// Replace the old lwwMergeBenchmark call with this
properLWWMergeBenchmark();
