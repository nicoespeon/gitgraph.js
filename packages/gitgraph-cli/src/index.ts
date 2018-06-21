import { GitgraphCore, RenderedData } from "gitgraph-core/lib/index";
import chalk from "chalk";

import render, { IRenderGraph } from "./render";

let graph: RenderedData;

const gitgraph = new GitgraphCore();
gitgraph.subscribe(() => graph = gitgraph.getRenderedData());

/* tslint:disable:no-console */
const consoleGraphRenderer: IRenderGraph = {
  commit(hash, subject) {
    console.log(`* ${chalk.green(hash)} ${subject}`);
  }
};

function renderGraph() {
  render(consoleGraphRenderer, graph);
}

export { gitgraph, renderGraph };
export * from "gitgraph-core/lib/index";
