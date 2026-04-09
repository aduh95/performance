"use strict";

const { TextDecoderStream } = require("node:stream/web");

/**
 * A TransformStream that converts raw chunks into lines of text.
 * It handles cases where a chunk might end in the middle of a line.
 */
const splitLinesTransform = () => {
  let buffer = "";
  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep the last partial line in the buffer
      for (const line of lines) {
        controller.enqueue(line);
      }
    },
    flush(controller) {
      if (buffer) controller.enqueue(buffer);
    },
  });
};

async function processWeatherData() {
  const DATA_URL =
    "https://raw.githubusercontent.com/juliangarnier/anime/master/package.json"; // Just a sample JSON file to act as a stream source

  console.log("--- Starting Web Stream Processing ---");

  try {
    const response = await fetch(DATA_URL);

    if (!response.body) {
      throw new Error("ReadableStream not supported on this response.");
    }

    // Pipeline:
    // 1. response.body (ReadableStream of Uint8Array)
    // 2. TextDecoderStream (Converts bytes to strings)
    // 3. splitLinesTransform (Chunks to lines)
    const lineStream = response.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(splitLinesTransform());

    const reader = lineStream.getReader();
    let lineCount = 0;

    // Consumption loop
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      lineCount++;
      // Log every 5 lines to show progress without flooding the console
      if (lineCount % 5 === 0) {
        console.log(
          `Processed line ${lineCount}: ${value.trim().substring(0, 40)}...`,
        );
      }
    }

    console.log("--- Stream Complete ---");
    console.log(`Total lines processed: ${lineCount}`);
  } catch (error) {
    console.error("Streaming error:", error);
  }
}

processWeatherData();
