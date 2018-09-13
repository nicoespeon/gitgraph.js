import * as readline from "readline";

import { ILogGraph, GraphMap } from "./compute-graph-map";
import consoleGraphLogger from "./console-graph-logger";

const DEFAULT_BUFFER_LENGTH = 10;

const bufferGraphLogger: ILogGraph = (graph) => {
  let start = 0;

  readline.emitKeypressEvents(process.stdin);

  // Capture keypress events without having to hit "Enter".
  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }

  process.stdin.on("keypress", (str, key: readline.Key) => {
    // Implement `less`-style commands.
    // https://en.wikipedia.org/wiki/Less_(Unix)#Frequently_used_commands
    if (key.name === "q") process.exit();
    if (key.ctrl && key.name === "c") process.exit();

    if (key.name === "up") moveOneLineUp();
    if (key.name === "k") moveOneLineUp();
    if (key.name === "b") moveOnePageUp();
    if (key.name === "g") moveToTop();
    if (key.sequence === "<") moveToTop();

    if (key.name === "down") moveOneLineDown();
    if (key.name === "j") moveOneLineDown();
    if (key.name === "return") moveOneLineDown();
    if (key.name === "space") moveOnePageDown();
    if (key.shift && key.name === "g") moveToBottom();
    if (key.sequence === ">") moveToBottom();
  });

  process.stdout.on("resize", () => {
    const displayedBufferLength = graph.length - start;
    if (bufferLength() >= displayedBufferLength) {
      start = Math.max(top(), bottom());
    }

    render();
  });

  render();

  function top() {
    return 0;
  }

  function bottom() {
    return graph.length - bufferLength();
  }

  function moveOneLineUp() {
    moveUpOf(1);
  }

  function moveOnePageUp() {
    moveUpOf(bufferLength());
  }

  function moveToTop() {
    moveUpOf(start);
  }

  function moveUpOf(lines: number) {
    if (start === 0) return;
    start = Math.max(start - lines, top());
    render();
  }

  function moveOneLineDown() {
    moveDownOf(1);
  }

  function moveOnePageDown() {
    moveDownOf(bufferLength());
  }

  function moveToBottom() {
    moveDownOf(graph.length);
  }

  function moveDownOf(lines: number) {
    if (end() >= graph.length) return;
    start = Math.min(start + lines, bottom());
    render();
  }

  function render() {
    clear();
    consoleGraphLogger(getBuffer());
  }

  function clear() {
    // ANSI Escape Sequence for `<ESC>c` which is the escape code
    // for resetting the terminal (clears the screen and buffer).
    // https://en.wikipedia.org/wiki/ANSI_escape_code
    process.stdout.write("\x1b[2J");
  }

  function getBuffer(): GraphMap {
    return graph.slice(start, end());
  }

  function end() {
    return start + bufferLength();
  }
};

export function bufferLength(): number {
  const length = process.env.BUFFER_LENGTH
    ? parseInt(process.env.BUFFER_LENGTH, 10)
    : process.stdout.rows || DEFAULT_BUFFER_LENGTH;

  // Length should be 0-indexed to compare with arrays.
  return length - 1;
}

export default bufferGraphLogger;
