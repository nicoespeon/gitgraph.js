import { GitgraphCore } from "gitgraph-core/lib";

// Domain (rendering logic)
import computeGraphMap from "./compute-graph-map";

// Infrastructure (logger implementations)
import consoleGraphLogger from "./console-graph-logger";

const gitgraph = new GitgraphCore();

function render() {
  const graphMap = computeGraphMap(gitgraph);
  consoleGraphLogger(graphMap);
}

export { gitgraph, render };
export * from "gitgraph-core/lib";
