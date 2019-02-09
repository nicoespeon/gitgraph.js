import { Branch } from "./branch";
import { Commit } from "./commit";

export class GraphColumns<TNode> {
  private branches: Set<Branch["name"]> = new Set();

  public constructor(commits: Array<Commit<TNode>>) {
    commits.forEach((commit) => this.branches.add(commit.branchToDisplay));
  }

  /**
   * Return the column index corresponding to given branch name.
   *
   * @param branchName Name of the branch
   */
  public get(branchName: Branch["name"]): number {
    return Array.from(this.branches).findIndex(
      (branch) => branch === branchName,
    );
  }
}
