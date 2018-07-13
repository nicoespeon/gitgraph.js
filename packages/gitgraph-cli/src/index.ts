import { GitgraphCore, RenderedData } from "gitgraph-core/lib/index";
import chalk from "chalk";

import render, { IRenderGraph } from "./render";

export { gitgraph, renderGraph };
export * from "gitgraph-core/lib/index";

let graph: RenderedData;

function gitgraph(): GitgraphCore {
  const gitgraphCore = new GitgraphCore();
  gitgraphCore.subscribe(() => graph = gitgraphCore.getRenderedData());

  return gitgraphCore;
}

/* tslint:disable:no-console */
const consoleGraphRenderer: IRenderGraph = {
  commit(hash, subject) {
    console.log(`* ${chalk.green(hash)} ${subject}`);
  }
};

function renderGraph() {
  render(consoleGraphRenderer, graph);
}
