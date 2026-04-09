import { opendir } from "node:fs/promises";
import { fork } from "node:child_process";
import test from "node:test";

function forkPromisified(...args) {
  let ipcMessages = [];

  const child = fork(...args);
  child.on("message", (data) => {
    ipcMessages.push(data);
  });

  return new Promise((resolve, reject) => {
    child.on("close", (code, signal) => {
      resolve({
        code,
        signal,
        ipcMessages,
      });
    });
    child.on("error", (code, signal) => {
      reject({
        code,
        signal,
        ipcMessages,
      });
    });
  });
}

const dirURL = new URL("./", import.meta.url);
const dir = await opendir(dirURL);
for await (const { name } of dir) {
  if (
    name === "index.mjs" ||
    name === "count-promise-allocations.js" ||
    name.startsWith(".")
  )
    continue;
  test(name, async (t) => {
    const { ipcMessages } = await forkPromisified(name, {
      execArgv: ["-r", "./count-promise-allocations.js"],
      cwd: dirURL,
    });
    t.assert.snapshot(ipcMessages);
  });
}
