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

// TODO: Full rebuilds could be put in a worker
class ChecksumTree {
  // Pending changes
  daysTouched = new Set<number>();
  // Values <absolute start date of period, checksums>
  years = new Map<number, number>();
  months = new Map<number, number>();
  days = new Map<number, number>();
  // Cached relationships
  monthDays = new Map<number, Set<number>>();
  yearMonths = new Map<number, Set<number>>();
  clearDay(dayBucket: number) {
    this.insertDay(dayBucket, []);
  }
  dirty() {
    return this.daysTouched.size > 0;
  }
  // Expects every entry for that day, and validates that they are for that day!
  insertDay(dayBucket: number, usecs: number[]) {
    const daysTouched: number[] = [];
    const checksum = usecs.reduce((xor, usec) => {
      const ms = usec / 1000;
      const day = Math.floor(ms / dayLike) * dayLike;
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
    let months = new Map<number, number>();
    let years = new Map<number, number>();
    // Calculate checksum for each month
    this.daysTouched.forEach((dayMs) => {
      const year = Math.floor(dayMs / yearLike) * yearLike;
      const month = Math.floor(dayMs / monthLike) * monthLike;
      const dayChecksum = this.days.get(dayMs);
      if (typeof dayChecksum !== "number") {
        throw new Error("Checksum tree failed. dayChecksum not found.");
      }
      // Update month check sum
      const monthChecksum = months.get(month);
      months.set(month, dayChecksum ^ (monthChecksum || 0));
      // Update year checksum
      const yearChecksum = years.get(year);
      years.set(year, dayChecksum ^ (yearChecksum || 0));
      // Update relationships
      if (!this.monthDays.has(month)) {
        this.monthDays.set(month, new Set());
      }
      this.monthDays.get(month)!.add(dayMs);
      if (!this.yearMonths.has(year)) {
        this.yearMonths.set(year, new Set());
      }
      this.yearMonths.get(year)!.add(month);
    });
    // Update months & years
    for (let entry of months.entries()) {
      this.months.set(entry[0], entry[1]);
    }
    for (let entry of years.entries()) {
      this.years.set(entry[0], entry[1]);
    }
    this.daysTouched.clear();
  }
}

const tree = new ChecksumTree();

// Testing a million items
for (let i = 0; i < 1000; i++) {
  const usecArr: number[] = [];
  const day = Date.now() - i * 1000 * 60 * 60 * 24;
  const dayBucket = Math.floor(day / dayLike) * dayLike;
  for (let i = 0; i < 100; i++) {
    const usecRand = Math.floor(day * 1000 - Math.random() * 1000 * 1000);
    usecArr.push(usecRand);
  }
  tree.insertDay(dayBucket, usecArr);
}
tree.commit();
console.log(tree.monthDays);
