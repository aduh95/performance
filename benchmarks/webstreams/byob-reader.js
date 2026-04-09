"use strict";
const { open } = require("node:fs/promises");
const { ReadableStream } = require("node:stream/web");

class Source {
  type = "bytes";
  autoAllocateChunkSize = 1024;

  async start(controller) {
    this.file = await open(__filename);
    this.controller = controller;
  }

  async pull(controller) {
    const view = controller.byobRequest?.view;
    const { bytesRead } = await this.file.read({
      buffer: view,
      offset: view.byteOffset,
      length: view.byteLength,
    });

    if (bytesRead === 0) {
      await this.file.close();
      this.controller.close();
    }
    controller.byobRequest.respond(bytesRead);
  }
}

const stream = new ReadableStream(new Source());

async function read(stream) {
  const reader = stream.getReader({ mode: "byob" });

  const chunks = [];
  let result;
  do {
    result = await reader.read(Buffer.alloc(100));
    if (result.value !== undefined) chunks.push(Buffer.from(result.value));
  } while (!result.done);

  return Buffer.concat(chunks);
}

read(stream).then((data) => console.log(Buffer.from(data).toString()));
