import { Branch } from "../branch";
import { Commit } from "../commit";

import { uniq } from "../utils";
import { CompareBranchesOrder } from "../branches-order";

export { DefaultRendering };

type Color = string;

class DefaultRendering<TNode> {
  protected branches: Set<Branch["name"]> = new Set();
  protected colors: Color[];
  protected rows = new Map<Commit["hash"], number>();
  protected cols = new Map<Commit["hash"], number>();
  protected maxRowCache: number | undefined = undefined;

  public constructor(
    commits: Array<Commit<TNode>>,
    colors: Color[],
    compareFunction: CompareBranchesOrder | undefined,
  ) {
    this.colors = colors;
    this.computeLayoutFromCommits(commits, compareFunction);
  }

  /**
   * Return the row index of particular commit.
   *
   * @param commitHash Hash of the commit
   */
  public getRowOf(commitHash: Commit["hash"]): number {
    return this.rows.get(commitHash) || 0;
  }

  /**
   * Return the highest row index in the layout
   */
  public getMaxRow(): number {
    if (this.maxRowCache === undefined) {
      this.maxRowCache = uniq(Array.from(this.rows.values())).length - 1;
    }
    return this.maxRowCache;
  }

  /**
   * Return the order of the given branch name.
   *
   * @param commitHash Hash of the commit
   */
  public getOrder(commitHash: Commit["hash"]): number {
    return this.cols.get(commitHash) || 0;
  }

  /**
   * Return the order of the given branch name.
   *
   * @param branchName Name of the branch
   */
  public getBranchOrder(branchName: Branch["name"]): number {
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
    return this.colors[this.getBranchOrder(branchName) % this.colors.length];
  }

  protected computeLayoutFromCommits(
    commits: Array<Commit<TNode>>,
    compareFunction: CompareBranchesOrder | undefined,
  ): void {
    commits.forEach((commit, i) => {
      // list branches
      this.branches.add(commit.branchToDisplay);
    });
    if (compareFunction) {
      this.branches = new Set(Array.from(this.branches).sort(compareFunction));
    }
    this.computePositions(commits);
    this.maxRowCache = undefined;
  }

  protected computePositions(commits: Array<Commit<TNode>>): void {
    commits.forEach((commit, i) => {
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
