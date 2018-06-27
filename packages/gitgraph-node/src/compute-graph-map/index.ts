import { GitgraphCore, Commit } from "gitgraph-core/lib";
import { chain, fill, includes, range } from "lodash";

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
  const openedBranches = [commits[0].x];

  let graph: GraphMap = [];
  commits.forEach((commit, index) => {
    const graphLine = emptyLine();

    // Commit message should always be at the end of the graph.
    graphLine[graphLine.length - 1] = {
      hash: commit.hashAbbrev,
      message: commit.subject,
      refs: commit.refs
    };

    graphLine[xToIndex(commit.x)] = GraphSymbol.Commit;

    const isFirstCommitOfNewBranch = !includes(openedBranches, commit.x);
    if (isFirstCommitOfNewBranch) {
      const previousCommit = commits[index - 1];
      graph = graph.concat(openBranchLines(previousCommit, commit));
      openedBranches.push(commit.x);
    }

    const isMergeCommit = (commit.parents.length > 1);
    if (isMergeCommit) {
      graph.push(mergeBranchLineTo(commit));
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

  function openBranchLines(origin: Commit, target: Commit): GraphLine[] {
    const start = xToIndex(origin.x) + 1;
    const end = xToIndex(target.x);

    return range(start, end).map((index) => {
      const line = emptyLine();
      line[index] = GraphSymbol.BranchOpen;
      return line;
    });
  }

  function mergeBranchLineTo(commit: Commit): GraphLine {
    const line = emptyLine();
    const mergedBranchIndex = (commit.x / branchSpacing) + 1;
    line[mergedBranchIndex] = GraphSymbol.BranchMerge;

    return line;
  }
}
