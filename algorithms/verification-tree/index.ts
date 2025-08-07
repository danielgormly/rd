// merkle tree aka hash tree prototype for airday
// serialisable
// sparse time buckets

// 07 aug 2025 = 1 754 521 824 888 milliseconds

const milliseconds = 1;
const seconds = 1 * 1000;
const minutes = 60 * 1000;
const hours = 3600 * 1000;
const days = 24 * 3600 * 1000;
const months = 30 * 24 * 3600 * 1000;
const years = 365 * 3600 * 1000;

// const hourLike = 5_000_000; // Slightly more than an hour (3600 * 1000)
const dayLike = 100_000_000; // 24 * 3600 * 1000 (nearest {5,1}x10^x) (86_400_000)
const monthLike = 5_000_000_000; // 30 * 24 * 3600 * 1000, 1<x<2 months approx
const yearLike = 50_000_000_000; // 365 * 24 * 3600 * 1000 (nearest {5,1}x10^x) (31_536_000_000)

// TODO: Consider hot path without a tree (some combo of checksum + count)

// What are we actually trying to keep consistent
// 1. counts, content (esp. id, attributes) -> perhaps server timestamps + ids are a good enough vector for this
// Merkle/checksum tree shines in this context, answering the question: what is missing or what is corrupt efficiently
// in any case - we need to keep track of windows of items, a count, and a check of how timestamps

async function sha256(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

class ChecksumTree {
  // TODO: EVERY item with this the finest hash granularity needs to stay here (perhaps an idb/sqlite index is needed - based on server timestamp)
  // TODO: A rebuild could be put in a worker
  // TODO: Clearing a day!!!
  daysTouched = new Set<number>(); // if there's a size it means it's dirty!
  years = new Map<number, number>();
  months = new Map<number, number>();
  days = new Map<number, number>(); // day, checksum of microsecond timestamps
  // Expects every entry for that day, and validates that they are for that day!
  clearDay(dayBucket: number) {
    this.insertDay(dayBucket, []);
  }
  insertDay(dayBucket: number, usecs: number[]) {
    const daysTouched: number[] = [];
    const checksum = usecs.reduce((xor, usec) => {
      const ms = usec / 1000;
      const day = Math.floor(ms / dayLike);
      if (day !== dayBucket) {
        throw new Error(
          `${usec} does not belong in day bucket in checksum tree`,
        );
      }
      daysTouched.push(day);
      return xor ^ usec;
    }, 0);
    this.days.set(dayBucket, checksum);
    this.daysTouched.add(dayBucket);
  }
  commit() {
    let monthsTouched = new Set<number>();
    let yearsTouched = new Set<number>();
    // Calculate checksum for each month
    this.daysTouched.forEach((dayMs) => {
      const month = Math.floor(dayMs / monthLike);
      const dayChecksum = this.days.get(dayMs);
      // xor all checksums for months
      // then xor all checksums for years
    });
    // Calculate checksum for each month
    // Calculate checksums for each year
    // return checksum (serialise in app to idb)
  }
}
