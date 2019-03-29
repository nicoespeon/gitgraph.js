import { Branch, BranchesOrderFunction } from "./branch";
import { Commit } from "./commit";

type Color = string;

export class BranchesOrder<TNode> {
  private branches: Set<Branch["name"]> = new Set();
  private colors: Color[];

  public constructor(
    commits: Array<Commit<TNode>>,
    colors: Color[],
    orderFunction: BranchesOrderFunction | undefined,
  ) {
    this.colors = colors;
    commits.forEach((commit) => this.branches.add(commit.branchToDisplay));
    if (orderFunction) {
      // reorder branches according to `orderFunction`
      this.branches = new Set(Array.from(this.branches).sort(orderFunction));
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
