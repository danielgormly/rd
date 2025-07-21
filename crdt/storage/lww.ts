export const genPid = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

const initialOffsetMs = Date.now() - performance.now();
const nextMicro = () => Math.floor(initialOffsetMs + performance.now() / 1000);

interface TimestampConstructorOps {
  utc: number;
  pid: number;
}

export type LWWTimestampArr = [number, number];

export class LWWTimestamp {
  utc: number; // Monotonic client wall clock in microseconds
  pid: number; // Process id
  constructor(opts: TimestampConstructorOps) {
    this.utc = opts.utc;
    this.pid = opts.pid;
  }
  greaterThan(other: LWWTimestamp): boolean {
    if (this.utc !== other.utc) {
      return this.utc > other.utc;
    }
    if (this.pid !== other.pid) {
      return this.pid > other.pid;
    }
    return false;
  }
  equals(other: LWWTimestamp): boolean {
    return this.utc === other.utc && this.pid === other.pid;
  }
  toArray(): LWWTimestampArr {
    return [this.utc, this.pid];
  }
  static fromArray(arr: LWWTimestampArr) {
    return new LWWTimestamp({
      utc: arr[0],
      pid: arr[1],
    });
  }
}

export class TimestampProducer {
  private pid: number;
  private lastUtc: number = 0;
  constructor(pid: number = genPid()) {
    this.pid = pid;
  }
  timestamp(): LWWTimestamp {
    const now = nextMicro();
    // Ensures monotonic timestamp + uniqueness
    if (now <= this.lastUtc) {
      this.lastUtc++;
    } else {
      this.lastUtc = now;
    }
    return new LWWTimestamp({
      utc: this.lastUtc,
      pid: this.pid,
    });
  }
}

export const globalTSProducer = new TimestampProducer();

export type SerialisedLWWRegister<T> = [LWWTimestampArr, T];

interface LWWRegisterConstructorOpts<T> {
  timestamp?: LWWTimestamp;
  data: T;
}

export class LWWRegister<T> {
  timestamp: LWWTimestamp;
  data: T;
  constructor(opts: LWWRegisterConstructorOpts<T>) {
    this.timestamp = opts.timestamp || globalTSProducer.timestamp();
    this.data = opts.data;
  }
  static fromJSON<T>(json: any): LWWRegister<T> {
    if (!Array.isArray(json) || json.length !== 2)
      throw new Error("Invalid LWWRegister format");
    const timestamp = LWWTimestamp.fromArray(json[0]);
    return new LWWRegister<T>({ timestamp, data: json[1] as unknown as T });
  }
  toJSON(): SerialisedLWWRegister<T> {
    return [this.timestamp.toArray(), this.data];
  }
  merge(other: LWWRegister<T>): LWWRegister<T> {
    // If timestamps are equal, check data consistency
    if (this.timestamp.equals(other.timestamp)) {
      // Same timestamp with different data is an error
      if (this.data !== other.data) {
        throw new Error(
          "Timestamp collision detected on merge between different data",
        );
      }
      // Same timestamp with same data - this is the same instance, return either one
      return this;
    }

    // Different timestamps - last write wins
    if (this.timestamp.greaterThan(other.timestamp)) {
      return this;
    }
    return other;
  }
}

export class LWWRegisterString extends LWWRegister<string> {
  constructor(opts: LWWRegisterConstructorOpts<string>) {
    super(opts);
  }
  static fromString(string: string) {
    return new LWWRegisterString({
      data: string,
    });
  }
}
