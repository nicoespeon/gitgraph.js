import { Commit } from "../commit";

import { RegularGraphRows } from "./regular";

export class CompactGraphRows<TNode> extends RegularGraphRows<TNode> {
  protected computeRowsFromCommits(commits: Array<Commit<TNode>>): void {
    commits.forEach((commit, i) => {
      let newRow = i;

      const isFirstCommit = i === 0;
      if (!isFirstCommit) {
        const parentRow = this.getRowOf(commit.parents[0]);
        const historyParent = commits[i - 1];
        newRow = Math.max(parentRow + 1, this.getRowOf(historyParent.hash));

        const isMergeCommit = commit.parents.length > 1;
        if (isMergeCommit) {
          // Push commit to next row to avoid collision when the branch in which
          // the merge happens has more commits than the merged branch.
          const mergeTargetParentRow = this.getRowOf(commit.parents[1]);
          if (parentRow < mergeTargetParentRow) newRow++;
        }
      }

      this.rows.set(commit.hash, newRow);
    });
  }
}
