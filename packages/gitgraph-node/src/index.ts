import { GitgraphCore } from "@gitgraph/core";

// Domain (rendering logic)
import computeGraphMap from "./compute-graph-map";

// Infrastructure (logger implementations)
import consoleGraphLogger from "./console-graph-logger";
import bufferGraphLogger, { bufferLength } from "./buffer-graph-logger";

class Gitgraph extends GitgraphCore {
  // Limiting Gitgraph Core config options is intentional since most of them
  // are not yet implemented in node.js.
  // Templates options should be limited & customized for the console.
  constructor() {
    super();
  }
}

function render(gitgraph: Gitgraph) {
  const graphMap = computeGraphMap(gitgraph);
  const useBuffer = graphMap.length > bufferLength();

  const logger = useBuffer ? bufferGraphLogger : consoleGraphLogger;
  logger(graphMap);
}

export { Gitgraph, render };
