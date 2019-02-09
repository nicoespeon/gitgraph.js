import { uniq } from "lodash";

import { Commit } from "../commit";

export class RegularGraphRows<TNode> {
  protected rows = new Map<Commit["hash"], number>();

  public constructor(commits: Array<Commit<TNode>>) {
    this.computeRowsFromCommits(commits);
  }

  public getRowOf(commitHash: Commit["hash"]): number {
    return this.rows.get(commitHash) || 0;
  }

  public getMaxRow(): number {
    return uniq(Array.from(this.rows.values())).length - 1;
  }

  protected computeRowsFromCommits(commits: Array<Commit<TNode>>): void {
    commits.forEach((commit, i) => {
      this.rows.set(commit.hash, i);
    });
  }
}
