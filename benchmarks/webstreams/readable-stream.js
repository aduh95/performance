"use strict";
const { ReadableStream } = require("node:stream/web");

const { setInterval: every } = require("node:timers/promises");

const { performance } = require("node:perf_hooks");

const CENTI_SECOND = 10;

const stream = new ReadableStream({
  async start(controller) {
    for await (const _ of every(CENTI_SECOND, null, {
      signal: AbortSignal.timeout(150),
    }))
      controller.enqueue(performance.now());
  },
});

(async () => {
  for await (const value of stream) console.log(value);
})().catch(() => {});
