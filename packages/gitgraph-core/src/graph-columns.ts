import Branch from "./branch";
import Commit from "./commit";

export class GraphColumns<TNode> {
  private columns: Array<Branch["name"]> = [];

  /**
   * Compute the graph columns from commits.
   *
   * @param commits List of graph commits
   */
  public constructor(commits: Array<Commit<TNode>>) {
    this.columns = [];
    commits.forEach((commit) => {
      const branch = commit.branchToDisplay;
      if (!this.columns.includes(branch)) this.columns.push(branch);
    });
  }

  /**
   * Return the column index corresponding to given branch name.
   *
   * @param branchName Name of the branch
   */
  public get(branchName: Branch["name"]): number {
    return this.columns.findIndex((col) => col === branchName);
  }
}
