import { GitgraphCore, RenderedData } from "gitgraph-core/lib/index";
import chalk from "chalk";

import render, { IRenderGraph } from "./render";

let graph: RenderedData;

const gitgraph = new GitgraphCore();
gitgraph.subscribe(() => graph = gitgraph.getRenderedData());

/* tslint:disable:no-console */
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

function renderGraph() {
  render(consoleGraphRenderer, graph);
}

export { gitgraph, renderGraph };
export * from "gitgraph-core/lib/index";
