/* tslint:disable:no-console */
import chalk from "chalk";

import { IRenderGraph } from "./render";

// Implements the domain interface with system's console.
const consoleGraphRenderer: IRenderGraph = {
  commit(hash, refs, subject, isOnBranch) {
    let commitText = `* ${chalk.green(hash)} `;

    if (isOnBranch) {
      commitText = `${chalk.red("|")} ${commitText}`;
    }

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

  branchOpen() {
    console.log(chalk.red("|\\"));
  }
};

export default consoleGraphRenderer;
