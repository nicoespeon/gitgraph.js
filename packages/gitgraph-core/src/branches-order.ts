import { Branch } from "./branch";
import { Commit } from "./commit";

export class BranchesOrder<TNode> {
  private branches: Set<Branch["name"]> = new Set();

  public constructor(commits: Array<Commit<TNode>>) {
    commits.forEach((commit) => this.branches.add(commit.branchToDisplay));
  }

  /**
   * Return the order of the given branch name.
   *
   * @param branchName Name of the branch
   */
  public get(branchName: Branch["name"]): number {
    return Array.from(this.branches).findIndex(
      (branch) => branch === branchName,
    );
  }
}
