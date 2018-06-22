import { GitgraphCore } from "gitgraph-core/lib/index";

// Domain (rendering logic)
import render from "./render";

// Infrastructure (renderer implementations)
import consoleGraphRenderer from "./console-graph-renderer";

const gitgraph = new GitgraphCore();

function renderGraph() {
  render(consoleGraphRenderer, gitgraph);
}

export { gitgraph, renderGraph };
export * from "gitgraph-core/lib/index";
