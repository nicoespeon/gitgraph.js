import { GitgraphCore, RenderedData } from "gitgraph-core/lib/index";
import chalk from "chalk";

import render, { IRenderGraph } from "./render";

let graph: RenderedData;

const gitgraph = new GitgraphCore();
gitgraph.subscribe(() => graph = gitgraph.getRenderedData());

/* tslint:disable:no-console */
const consoleGraphRenderer: IRenderGraph = {
  commit(hash, refs, subject) {
    if (refs.length > 0) {
      refs = refs.map((ref) =>  (ref === "HEAD") ? chalk.bold(ref) : ref);
      const refsText = chalk.blue(`(${refs.join(", ")})`);
      console.log(`* ${chalk.green(hash)} ${refsText} ${subject}`);
    } else {
      console.log(`* ${chalk.green(hash)} ${subject}`);
    }
  }
};

function renderGraph() {
  render(consoleGraphRenderer, graph);
}

export { gitgraph, renderGraph };
export * from "gitgraph-core/lib/index";
