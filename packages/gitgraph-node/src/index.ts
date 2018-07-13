import { GitgraphCore } from "gitgraph-core/lib";

// Domain (rendering logic)
import computeGraphMap from "./compute-graph-map";

// Infrastructure (logger implementations)
import consoleGraphLogger from "./console-graph-logger";

function createGitgraph(): GitgraphCore {
  // Limiting Gitgraph Core config options is intentional since most of them
  // are not yet implemented in node.js.
  // Templates options should be limited & customized for the console.
  return new GitgraphCore();
}

function render(gitgraph: GitgraphCore) {
  const graphMap = computeGraphMap(gitgraph);
  consoleGraphLogger(graphMap);
}

export { createGitgraph, render };
