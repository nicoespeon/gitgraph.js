import { Branch } from "./branch";
import { Commit } from "./commit";

export { BranchesOrder, CompareBranchesOrder };

type Color = string;

/**
 * Function used to determine the order of the branches in the rendered graph.
 *
 * Returns a value:
 * - < 0 if `branchNameA` should render before `branchNameB`
 * - \> 0 if `branchNameA` should render after `branchNameB`
 * - = 0 if ordering of both branches shouldn't change
 */
type CompareBranchesOrder = (
  branchNameA: Branch["name"],
  branchNameB: Branch["name"],
) => number;

class BranchesOrder<TNode> {
  private branches: Set<Branch["name"]> = new Set();
  private colors: Color[];

  public constructor(
    commits: Array<Commit<TNode>>,
    colors: Color[],
    compareFunction: CompareBranchesOrder | undefined,
  ) {
    this.colors = colors;
    commits.forEach((commit) => this.branches.add(commit.branchToDisplay));

    if (compareFunction) {
      this.branches = new Set(Array.from(this.branches).sort(compareFunction));
    }
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

  /**
   * Return the color of the given branch.
   *
   * @param branchName Name of the branch
   */
  public getColorOf(branchName: Branch["name"]): Color {
    return this.colors[this.get(branchName) % this.colors.length];
  }
}
