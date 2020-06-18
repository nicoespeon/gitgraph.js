import { Commit } from "../commit";
import FastPriorityQueue from "fastpriorityqueue";

import { DefaultRendering } from "./default";

export { CompactRendering };

class GitamineRendering<TNode> extends DefaultRendering<TNode> {
  protected computePositions(commits: Array<Commit<TNode>>): void {
    commits.forEach((commit, i) => {
      // TODO
      // columns
      const col = Array.from(this.branches).findIndex(
        (branch) => branch === commit.branchToDisplay,
      );
      this.cols.set(commit.hash, col);
      // rows
      this.rows.set(commit.hash, i);
    });
  }
}
