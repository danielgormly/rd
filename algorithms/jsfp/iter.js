function producer() {
  const buffer = [];
  let sub = () => {}; // noop

  setInterval(() => {
    const value = Math.floor(Math.random() * 10).toString();
    buffer.push(value);
    sub(value);
  }, 100);
  return {
    [Symbol.asyncIterator]() {
      return {
        next() {
          return new Promise((resolve) => {
            if (buffer.length > 0) {
              const res = { value: buffer.shift(), done: false };
              resolve(res);
              return;
            } else {
              sub = (value) => {
                resolve({ value: buffer.shift(), done: false });
                sub = () => {};
              };
              return;
            }
          });
        },
      };
    },
  };
}

async function* parse(string_batch) {
  for await (const str of string_batch) {
    yield Number(str);
  }
}

async function* multiply(numbers) {
  for await (const num of numbers) {
    yield num * 2;
  }
}

async function* sum(numbers) {
  let passed = performance.now();
  let summed = 0;
  let count = 0;
  for await (const num of numbers) {
    summed = summed + num;
    count++;
    if (count > 250 || performance.now() - passed > 50) {
      const result = {
        count,
        summed,
      };
      count = 0;
      summed = 0;
      passed = performance.now();
      yield result;
    }
  }
}

async function run() {
  const messages = producer();
  const parsed = parse(messages);
  const multiplied = multiply(parsed);
  const zz = sum(multiplied);
  for await (const message of zz) {
    console.log(message);
  }
}

run().catch((err) => console.log("runner error", err));
