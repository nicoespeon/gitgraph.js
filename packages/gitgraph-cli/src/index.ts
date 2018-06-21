import { GitgraphCore, RenderedData } from "gitgraph-core/lib/index";

// Domain (rendering logic)
import render from "./render";

// Infrastructure (renderer implementations)
import consoleGraphRenderer from "./console-graph-renderer";

let graph: RenderedData;

const gitgraph = new GitgraphCore();
gitgraph.subscribe(() => graph = gitgraph.getRenderedData());

function renderGraph() {
  render(consoleGraphRenderer, graph);
}

export { gitgraph, renderGraph };
export * from "gitgraph-core/lib/index";
