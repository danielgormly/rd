// Microseconds the way to go?
const max = Number.MAX_SAFE_INTEGER;
console.log(`${max} (MAX_SAFE_INTEGER)`);
const ms = Date.now(); // milliseconds since unix epoch (int)
console.log(`${ms} (utc ms)`);
console.log(ms * 1000, "(utc microseconds)");
const pnow = performance.now(); // milliseconds (float)
console.log(pnow);
const microsecondsPerf = Math.floor(pnow * 1000);
console.log(microsecondsPerf);

// max date in microseconds
console.log(new Date(Number.MAX_SAFE_INTEGER / 1000));
// = 2255-06-05 we'll literally all be dead and my software can be written in a nanosecond
// by an rtx 90070 or some quantum bullshit but will be redundant at that point
