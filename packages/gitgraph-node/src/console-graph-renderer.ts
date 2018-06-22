/* tslint:disable:no-console */
import chalk from "chalk";

import { IRenderGraph } from "./render";

// Implements the domain interface with system's console.
const consoleGraphRenderer: IRenderGraph = {
  commit(hash, refs, subject, branchOffsetLeft, branchOffsetRight, messageOffset) {
    let commitText = `${chalk.red("|")} `.repeat(branchOffsetLeft);
    commitText += `* `;
    commitText += `${chalk.red("|")} `.repeat(branchOffsetRight);
    commitText += "  ".repeat(messageOffset);
    commitText += `${chalk.green(hash)} `;

    if (refs.length > 0) {
      const parsedRefs = refs.map((ref) => {
        return (ref === "HEAD") ? chalk.bold(ref) : ref;
      });
      commitText += chalk.blue(`(${parsedRefs.join(", ")})`);
      commitText += " ";
    }

    commitText += `${subject}`;

    console.log(commitText);
  },

  openBranch() {
    console.log(chalk.red("|\\"));
  }
};

export default consoleGraphRenderer;