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

enum NodeType {
  Day,
  Month,
  Year,
}

class ChecksumNode {
  type: NodeType;
  parent?: ChecksumNode;
  store: ChecksumStore;
  index: number;
  checksum?: number;
  constructor(store: ChecksumStore, index: number) {
    this.store = store;
    this.index = index;
  }
}

class YearNode extends ChecksumNode {
  type = NodeType.Year;
  children = new Map<number, MonthNode>();
}

class MonthNode extends ChecksumNode {
  type = NodeType.Month;
  children = new Map<number, DayNode>();
  setParent(yearNode: YearNode) {
    this.parent = yearNode;
  }
}

class DayNode extends ChecksumNode {
  type = NodeType.Day;
  checksum: number;
  constructor(store: ChecksumStore, index: number, checksum: number) {
    super(store, index);
    this.checksum = checksum;
  }
  setParent(monthNode: MonthNode) {
    this.parent = monthNode;
  }
}

class ChecksumStore {
  // Pending changes
  daysTouched = new Set<number>();
  // Base values <absolute start date of period, checksums>
  days = new Map<number, DayNode>(); // quick access (TODO: is this necessary...? think about usage patterns when done)
  // Multi-level index
  years = new Map<number, YearNode>();
  clearDay(dayBucket: number) {
    // TODO: Remove links, check month child lengths & year child lengths, removing where required (TODO: Could be placed within insertDay?)
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
          `${usec} does not belong in day bucket in checksum index`,
        );
      }
      daysTouched.push(day);
      return xor ^ usec;
    }, 0);
    this.days.set(dayBucket, new DayNode(this, dayBucket, checksum));
    this.daysTouched.add(dayBucket);
  }
  commit() {
    let monthsTouched = new Set<MonthNode>();
    let yearsTouched = new Set<YearNode>();
    // Calculate checksum for each month
    this.daysTouched.forEach((dayMs) => {
      // Set or get year
      const year = Math.floor(dayMs / yearLike) * yearLike;
      const yearEntry = this.years.get(year);
      let yearNode = yearEntry || new YearNode(this, year);
      if (!yearEntry) {
        this.years.set(year, yearNode);
      }
      yearsTouched.add(yearNode);

      // Set or get month
      const month = Math.floor(dayMs / monthLike) * monthLike;
      const monthEntry = yearNode.children.get(month);
      const monthNode = monthEntry || new MonthNode(this, month);
      monthNode.children.set(dayMs, this.days.get(dayMs)!);
      if (!monthEntry) {
        yearNode.children.set(month, monthNode);
      }
      monthsTouched.add(monthNode);
    });

    monthsTouched.forEach((month) => {
      month.checksum = Array.from(month.children.values()).reduce(
        (xor, dayNode) => {
          if (!dayNode.checksum) {
            console.log(dayNode);
            throw new Error("Missing day checksum");
          }
          return xor ^ dayNode.checksum;
        },
        0,
      );
    });
    yearsTouched.forEach((year) => {
      year.checksum = Array.from(year.children.values()).reduce(
        (xor, monthNode) => {
          if (!monthNode.checksum) throw new Error("Missing month checksum");
          return xor ^ monthNode.checksum;
        },
        0,
      );
    });
    this.daysTouched.clear();
  }
}

const store = new ChecksumStore();

// Testing a million items
for (let i = 0; i < 100; i++) {
  const usecArr: number[] = [];
  const day = Date.now() - i * 1000 * 60 * 60 * 24;
  const dayBucket = Math.floor(day / dayLike) * dayLike;
  for (let i = 0; i < 100; i++) {
    const usecRand = Math.floor(day * 1000 - Math.random() * 1000 * 1000);
    usecArr.push(usecRand);
    usecArr.push(usecRand);
  }
  store.insertDay(dayBucket, usecArr);
}
store.commit();
// console.log(store.years);
