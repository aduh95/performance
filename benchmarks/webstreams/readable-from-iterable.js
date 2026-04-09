"use strict";
const { ReadableStream } = require("node:stream/web");

async function* asyncIterableGenerator() {
  yield "a";
  yield "b";
  yield "c";
}

(async () => {
  const stream = ReadableStream.from(asyncIterableGenerator());

  for await (const chunk of stream) console.log(chunk); // Prints: 'a', 'b', 'c'
})();
