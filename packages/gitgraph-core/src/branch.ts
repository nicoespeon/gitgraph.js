import Commit, { CommitRenderOptions } from "./commit";
import { GitgraphCore } from "./gitgraph";
import { BranchUserApi } from "./branch-user-api";
import { CommitStyleOptions, BranchStyle } from "./template";

export interface BranchCommitDefaultOptions<TNode>
  extends CommitRenderOptions<TNode> {
  author?: string;
  subject?: string;
  style?: CommitStyleOptions;
}

export interface BranchOptions<TNode = SVGElement> {
  /**
   * Gitgraph constructor
   */
  gitgraph: GitgraphCore<TNode>;
  /**
   * Branch name
   */
  name: string;
  /**
   * Branch style
   */
  style: BranchStyle;
  /**
   * Parent commit
   */
  parentCommitHash?: Commit["hash"];
  /**
   * Default options for commits
   */
  commitDefaultOptions?: BranchCommitDefaultOptions<TNode>;
  /**
   * On graph update.
   */
  onGraphUpdate: () => void;
}

export const DELETED_BRANCH_NAME = "";

export class Branch<TNode = SVGElement> {
  public name: BranchOptions["name"];
  public style: BranchStyle;
  public computedColor?: BranchStyle["color"];
  public parentCommitHash: BranchOptions["parentCommitHash"];
  public commitDefaultOptions: BranchCommitDefaultOptions<TNode>;

  private gitgraph: GitgraphCore<TNode>;
  private onGraphUpdate: () => void;

  constructor(options: BranchOptions<TNode>) {
    this.gitgraph = options.gitgraph;
    this.name = options.name;
    this.style = options.style;
    this.parentCommitHash = options.parentCommitHash;
    this.commitDefaultOptions = options.commitDefaultOptions || { style: {} };
    this.onGraphUpdate = options.onGraphUpdate;
  }

  /**
   * Return the API to manipulate Gitgraph branch as a user.
   */
  public getUserApi(): BranchUserApi<TNode> {
    return new BranchUserApi(this, this.gitgraph, this.onGraphUpdate);
  }

  /**
   * Return true if branch was deleted.
   */
  public isDeleted(): boolean {
    return this.name === DELETED_BRANCH_NAME;
  }

  private areCommitsConnected(
    parentCommitHash: Commit["hash"],
    childCommitHash: Commit["hash"],
  ): boolean {
    const childCommit = this.gitgraph.commits.find(
      ({ hash }) => childCommitHash === hash,
    );
    if (!childCommit) return false;

    const isFirstCommitOfGraph = childCommit.parents.length === 0;
    if (isFirstCommitOfGraph) return false;

    if (childCommit.parents.includes(parentCommitHash)) {
      return true;
    }

    // `childCommitHash` is not a direct child of `parentCommitHash`.
    // But maybe one of `childCommitHash` parent is.
    return childCommit.parents.some((directParentHash) =>
      this.areCommitsConnected(parentCommitHash, directParentHash),
    );
  }
}

export default Branch;

export function createDeletedBranch<TNode>(
  gitgraph: GitgraphCore<TNode>,
  style: BranchStyle,
  onGraphUpdate: () => void,
): Branch<TNode> {
  return new Branch({
    name: DELETED_BRANCH_NAME,
    gitgraph,
    style,
    onGraphUpdate,
  });
}
