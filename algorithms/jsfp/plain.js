function producer() {
  const strs = [];
  for (let i = 0; i < 10; i++) {
    strs.push(Math.floor(Math.random() * 10).toString());
  }
  return strs;
}

function parse(string_batch) {
  const batch = [];
  for (const str of string_batch) {
    batch.push(Number(str));
  }
  return batch;
}

function multiply(numbers) {
  return numbers.map((num) => num * 2);
}

function sum(numbers) {
  return numbers.reduce((acc, val) => {
    return acc + val;
  }, 0);
}

function run() {
  const string_batch = producer();
  console.log("strings", string_batch);
  const number_batch = parse(string_batch);
  console.log("numbers", number_batch);
  const multiplied = multiply(number_batch);
  console.log("doubled", multiplied);
  const total = sum(multiplied);
  console.log("total", total);
}

run();
