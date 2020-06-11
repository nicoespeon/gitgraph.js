import { Commit } from "../commit";

import { RegularGraphRows } from "./regular";

export class GitamineGraphRows<TNode> extends RegularGraphRows<TNode> {
  protected computeRowsFromCommits(commits: Array<Commit<TNode>>): void {
    commits.forEach((commit, i) => {
      let newRow = i;

      // TODO update newRow variable to follow Gitamine algorithm

      this.rows.set(commit.hash, newRow);
    });
  }
}
