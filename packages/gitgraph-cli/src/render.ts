import { RenderedData, Commit } from "gitgraph-core/lib/index";

export default render;

export interface IRenderGraph {
  commit(hash: string, refs: string[], subject: string, isOnBranch: boolean): void;
  branchOpen(): void;
}

// Translate rendered data into CLI logic.
//
// This is necessary because rendered data are optimized for browsers.
// Rendering is a bit different in CLI since we don't have pixels.
// Thus, we should translate data to have "line-per-line" instructions.
function render(logger: IRenderGraph, { commits }: RenderedData): void {
  commits.forEach((commit, index) => {
    const remainingCommits = commits.slice(index + 1);
    const isOnBranch = (commit.x !== 0 && !canFastForward(remainingCommits));
    if (isOnBranch) logger.branchOpen();
    logger.commit(commit.hashAbbrev, commit.refs, commit.subject, isOnBranch);
  });
}

function canFastForward(commits: Commit[]): boolean {
  return (commits.length === 0);
}
