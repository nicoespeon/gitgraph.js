import { GitgraphCore } from "gitgraph-core/lib/index";
import { includes } from "lodash";

export default render;

export interface IRenderGraph {
  commit(
    hash: string,
    refs: string[],
    subject: string,
    branchOffsetLeft: number,
    branchOffsetRight: number,
    messageOffset: number
  ): void;
  openBranch(): void;
}

// Translate rendered data into CLI logic.
//
// This is necessary because rendered data are optimized for browsers.
// Rendering is a bit different in CLI since we don't have pixels.
// Thus, we should translate data to have "line-per-line" instructions.
function render(logger: IRenderGraph, gitgraph: GitgraphCore): void {
  const { commits, commitMessagesX } = gitgraph.getRenderedData();
  const branchSpacing = gitgraph.template.branch.spacing;

  const firstCommitBranches = commits[0].branches;
  const openedBranches = firstCommitBranches ? [firstCommitBranches![0]] : [];

  commits.forEach((commit) => {
    let branchIndex = 0;
    if (commit.branches) {
      const isFirstCommitOfNewBranch = !includes(openedBranches, commit.branches[0]);
      if (isFirstCommitOfNewBranch) {
        logger.openBranch();
        openedBranches.push(commit.branches[0]);
      }

      branchIndex = openedBranches.indexOf(commit.branches[0]);
    }

    const branchOffsetLeft = (commit.x / branchSpacing);
    const branchOffsetRight = openedBranches.length - (branchIndex + 1);
    const messageOffset = (commitMessagesX / branchSpacing) - 1 - branchOffsetLeft - branchOffsetRight;
    logger.commit(
      commit.hashAbbrev,
      commit.refs,
      commit.subject,
      branchOffsetLeft,
      branchOffsetRight,
      messageOffset
    );
  });
}
