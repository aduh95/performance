"use strict";
const consumers = require("node:stream/consumers");
const { Readable } = require("node:stream");

const items = Array.from(
  {
    length: 100,
  },
  () => ({
    message: "hello world from consumers!",
  }),
);

for (const consumer of Object.values(consumers)) {
  const readable = Readable.from(JSON.stringify(items));
  consumer(readable).then((data) => {
    console.log(`from readable: ${data.byteLength}`);
  });
}
