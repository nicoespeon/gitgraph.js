import { GitgraphCore, Commit } from "gitgraph-core/lib";
import { chain, fill, includes } from "lodash";

import connectBranchCommits from "./connect-branch-commits";

export default computeGraphMap;

export interface GraphCommit {
  hash: string;
  message: string;
  refs: string[];
}
export enum GraphSymbol {
  // Use string values to ease testing & debugging.
  // e.g. `GraphSymbol.Commit === "*"` in tests
  Commit = "*",
  Empty = " ",
  Branch = "|",
  BranchOpen = "\\",
  BranchMerge = "/"
}
export type GraphLine = Array<GraphSymbol|GraphCommit>;
type GraphMap = GraphLine[];

export type ILogGraph = (graph: GraphMap) => void;

// Translate rendered data into CLI logic.
//
// This is necessary because rendered data are optimized for browsers.
// Rendering is a bit different in CLI since we don't have pixels.
// Thus, we should translate data to have "line-per-line" instructions.
function computeGraphMap(gitgraph: GitgraphCore): GraphMap {
  const { commits, commitMessagesX } = gitgraph.getRenderedData();
  const branchSpacing = gitgraph.template.branch.spacing;
  const graphSize = xToIndex(commitMessagesX);

  const firstCommitBranches = commits[0].branches;
  const openedBranches = firstCommitBranches ? [firstCommitBranches![0]] : [];

  const graph: GraphMap = [];
  commits.forEach((commit) => {
    const graphLine = emptyLine();

    // Commit message should always be at the end of the graph.
    graphLine[graphLine.length - 1] = {
      hash: commit.hashAbbrev,
      message: commit.subject,
      refs: commit.refs
    };

    graphLine[xToIndex(commit.x)] = GraphSymbol.Commit;

    if (commit.branches) {
      const isFirstCommitOfNewBranch = !includes(openedBranches, commit.branches[0]);
      if (isFirstCommitOfNewBranch) {
        graph.push(openBranchLineTo(commit));
        openedBranches.push(commit.branches[0]);
      }
    }

    graph.push(graphLine);
  });

  return chain(graph)
    // Transpose the graph so columns => lines (easier to map).
    .unzip()
    .map(connectBranchCommits)
    // Transpose again to return the proper graph.
    .unzip()
    .value();

  function xToIndex(x: number): number {
    return (x / branchSpacing) * 2;
  }

  function emptyLine(): GraphLine {
    return fill(Array(graphSize), GraphSymbol.Empty);
  }

  function openBranchLineTo(commit: Commit): GraphLine {
    const line = emptyLine();
    const openBranchIndex = (commit.x / branchSpacing);
    line[openBranchIndex] = GraphSymbol.BranchOpen;

    return line;
  }
}
