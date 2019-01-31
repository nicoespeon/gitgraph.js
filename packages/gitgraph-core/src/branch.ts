import Commit, { CommitRenderOptions } from "./commit";
import { GitgraphCore, Mode } from "./gitgraph";
import { GitgraphCommitOptions } from "./gitgraph-user-api";
import { BranchUserApi } from "./branch-user-api";
import { CommitStyleOptions, CommitStyle, BranchStyle } from "./template";
import { withoutUndefinedKeys } from "./utils";

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

interface BranchMergeOptions<TNode> {
  /**
   * Branch or branch name.
   */
  branch: string | Branch<TNode>;
  /**
   * Merge commit message subject.
   */
  subject?: string;
  /**
   * If `true`, perform a fast-forward merge (if possible).
   */
  fastForward?: boolean;
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
   * Create a merge commit.
   *
   * @param branch Branch
   * @param subject Merge commit message
   */
  public merge(branch: Branch<TNode>, subject?: string): Branch<TNode>;
  /**
   * Create a merge commit.
   *
   * @param branchName Branch name
   * @param subject Merge commit message
   */
  public merge(branchName: string, subject?: string): Branch<TNode>;
  /**
   * Create a merge commit.
   *
   * @param options Options of the merge
   */
  public merge(options: BranchMergeOptions<TNode>): Branch<TNode>;
  public merge(...args: any[]): Branch<TNode> {
    let options = args[0];
    if (!isBranchMergeOptions<TNode>(options)) {
      options = { branch: args[0], subject: args[1], fastForward: false };
    }
    const { branch, subject, fastForward } = options;

    const branchName = typeof branch === "string" ? branch : branch.name;
    const branchLastCommitHash = this.gitgraph.refs.getCommit(branchName);
    if (!branchLastCommitHash) {
      throw new Error(`The branch called "${branchName}" is unknown`);
    }

    let canFastForward = false;
    const lastCommitHash = this.gitgraph.refs.getCommit(this.name);
    if (lastCommitHash) {
      canFastForward = this.areCommitsConnected(
        lastCommitHash,
        branchLastCommitHash,
      );
    } else {
      canFastForward = false;
    }

    if (fastForward && canFastForward) {
      this.fastForwardTo(branchLastCommitHash);
    } else {
      this.commitWithParents(
        { subject: subject || `Merge branch ${branchName}` },
        [branchLastCommitHash],
      );
    }

    this.onGraphUpdate();
    return this;
  }

  /**
   * Checkout onto this branch
   */
  public checkout(): Branch<TNode> {
    this.gitgraph.currentBranch = this;
    return this;
  }

  /**
   * Tag the last commit of the branch
   *
   * @param name Name of the tag
   */
  public tag(name: string): Branch<TNode> {
    this.gitgraph.getUserApi().tag(name, this.name);
    return this;
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

  private fastForwardTo(commitHash: Commit["hash"]): void {
    this.gitgraph.refs.set(this.name, commitHash);
  }

  private commitWithParents(
    options: GitgraphCommitOptions<TNode>,
    parents: string[],
  ): void {
    const parentOnSameBranch = this.gitgraph.refs.getCommit(this.name);
    if (parentOnSameBranch) {
      parents.unshift(parentOnSameBranch);
    } else if (this.parentCommitHash) {
      parents.unshift(this.parentCommitHash);
    }

    const { tag, ...commitOptions } = options;
    const commit = new Commit({
      author: this.commitDefaultOptions.author || this.gitgraph.author,
      subject:
        this.commitDefaultOptions.subject ||
        (this.gitgraph.commitMessage as string),
      ...commitOptions,
      parents,
      style: this.getCommitStyle(options.style),
    });

    if (parentOnSameBranch) {
      // Take all the refs from the parent
      const parentRefs = this.gitgraph.refs.getNames(parentOnSameBranch);
      parentRefs.forEach((ref) => this.gitgraph.refs.set(ref, commit.hash));
    } else {
      // Set the branch ref
      this.gitgraph.refs.set(this.name, commit.hash);
    }

    // Add the new commit
    this.gitgraph.commits.push(commit);

    // Move HEAD on the last commit
    this.checkout();
    this.gitgraph.refs.set("HEAD", commit.hash);

    // Add a tag to the commit if `option.tag` is provide
    if (tag) this.tag(tag);
  }

  /**
   * Get the consolidate style for one commit
   *
   * This consolidate the styling rules in this order:
   * - branch color
   * - template commit base
   * - branch override
   * - commit override
   * @param style
   */
  private getCommitStyle(style: CommitStyleOptions = {}): CommitStyle {
    const message = {
      ...withoutUndefinedKeys(this.gitgraph.template.commit.message),
      ...withoutUndefinedKeys(this.commitDefaultOptions.style!.message),
      ...style.message,
    };

    if (!this.gitgraph.isVertical || this.gitgraph.mode === Mode.Compact) {
      message.display = false;
    }

    return {
      ...withoutUndefinedKeys(this.gitgraph.template.commit),
      ...withoutUndefinedKeys(this.commitDefaultOptions.style),
      ...style,
      message,
      dot: {
        ...withoutUndefinedKeys(this.gitgraph.template.commit.dot),
        ...withoutUndefinedKeys(this.commitDefaultOptions.style!.dot),
        ...style.dot,
      },
    } as CommitStyle;
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

function isBranchMergeOptions<TNode>(
  options: BranchMergeOptions<TNode> | any,
): options is BranchMergeOptions<TNode> {
  return typeof options === "object" && !(options instanceof Branch);
}
