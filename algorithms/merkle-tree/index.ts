// merkle tree aka hash tree prototype for airday
// serialisable
// sparse time buckets

// 07 aug 2025 = 1 754 521 824 888 milliseconds

const milliseconds = 1;
const seconds = 1 * 1000;
const minutes = 60 * 1000;
const hours = 3600 * 1000;
const days = 24 * 3600 * 1000;
const months = 24 * 3600 * 1000;
const years = 365 * 3600 * 1000;

const hourLike = 5_000_000; // Slightly more than an hour (3600 * 1000)
const dayLike = 100_000_000; // 24 * 3600 * 1000 (nearest {5,1}x10^x) (86_400_000)
const yearLike = 50_000_000_000; // 365 * 24 * 3600 * 1000 (nearest {5,1}x10^x) (31_536_000_000)

// TODO: Consider hot path

class MerkleTree {
  insert(utcTimestamp: number) {
    const year = Math.floor(utcTimestamp / yearLike);
    const yearRemainder = utcTimestamp - year * yearLike;
    const day = Math.floor(yearRemainder / dayLike);
    const dayRemainder = yearRemainder - day * dayLike;
    const hour = Math.floor(dayRemainder / hourLike);
  }
  insertMicrosecond(microTimestamp: number) {
    this.insert(microTimestamp / 1000);
  }
}
