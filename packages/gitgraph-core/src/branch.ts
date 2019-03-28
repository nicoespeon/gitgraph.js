import { Commit, CommitRenderOptions } from "./commit";
import { GitgraphCore } from "./gitgraph";
import { BranchUserApi } from "./user-api/branch-user-api";
import { TemplateOptions, BranchStyle } from "./template";

export {
  BranchCommitDefaultOptions,
  BranchOptions,
  BranchesOrderFunction,
  DELETED_BRANCH_NAME,
  createDeletedBranch,
  Branch,
};

interface BranchCommitDefaultOptions<TNode> extends CommitRenderOptions<TNode> {
  author?: string;
  subject?: string;
  style?: TemplateOptions["commit"];
}

interface BranchOptions<TNode = SVGElement> {
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

/**
 * Type of a function which defines branch order in computed branches paths.
 * Returns:
 * - negative number if `branchNameA` should be rendered before `branchNameB`
 * - positive number if `branchNameA` should be rendered after `branchNameB`
 */
type BranchesOrderFunction = (
  branchNameA: Branch["name"],
  branchNameB: Branch["name"],
) => number;

const DELETED_BRANCH_NAME = "";

class Branch<TNode = SVGElement> {
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
}

function createDeletedBranch<TNode>(
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
