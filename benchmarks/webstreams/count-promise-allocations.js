"use strict";
const async_hooks = require("node:async_hooks");

let activePromises = 0;
let totalPromises = 0;

const hook = async_hooks.createHook({
  init(_, type) {
    if (type === "PROMISE") {
      activePromises++;
      totalPromises++;
    }
  },
  destroy(asyncId) {
    // destroy is not always reliable for promises,
    // but can give a rough idea
    activePromises--;
  },
});

hook.enable();

process.on("beforeExit", () => {
  process.send({ activePromises, totalPromises });
});
