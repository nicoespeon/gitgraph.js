import Commit, { CommitRenderOptions } from "./commit";
import { GitgraphCore, GitgraphCommitOptions, Mode } from "./gitgraph";
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
}

export const DELETED_BRANCH_NAME = "";

/**
 * Branch
 */
export class Branch<TNode = SVGElement> {
  public name: BranchOptions["name"];
  public style: BranchStyle;
  public commitDefaultOptions: BranchCommitDefaultOptions<TNode>;
  public computedColor?: BranchStyle["color"];

  private gitgraph: GitgraphCore<TNode>;
  private parentCommitHash: BranchOptions["parentCommitHash"];

  /**
   * Branch constructor
   * @param options options
   */
  constructor(options: BranchOptions<TNode>) {
    this.gitgraph = options.gitgraph;
    this.name = options.name;
    this.style = options.style;
    this.parentCommitHash = options.parentCommitHash;
    this.commitDefaultOptions = options.commitDefaultOptions || { style: {} };
  }

  /**
   * Add a new commit in the branch (as `git commit`).
   *
   * @param subject Commit subject
   */
  public commit(subject?: string): Branch<TNode>;
  /**
   * Add a new commit in the branch (as `git commit`).
   *
   * @param options Options of the commit
   */
  public commit(options?: GitgraphCommitOptions<TNode>): Branch<TNode>;
  public commit(
    options?: GitgraphCommitOptions<TNode> | string,
  ): Branch<TNode> {
    // Deal with shorter syntax
    if (typeof options === "string") options = { subject: options as string };
    if (!options) options = {};
    if (!options.parents) options.parents = [];

    const parentOnSameBranch = this.gitgraph.refs.getCommit(this.name);
    if (parentOnSameBranch) {
      options.parents.unshift(parentOnSameBranch);
    } else if (this.parentCommitHash) {
      options.parents.unshift(this.parentCommitHash);
    }

    const { tag, ...commitOptions } = options;
    const commit = new Commit({
      author: this.commitDefaultOptions.author || this.gitgraph.author,
      subject:
        this.commitDefaultOptions.subject ||
        (this.gitgraph.commitMessage as string),
      ...commitOptions,
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

    // Update the render
    this.gitgraph.next();

    return this;
  }

  /**
   * Create a merge commit.
   *
   * @param branch Branch
   * @param message Merge commit message
   */
  public merge(branch: Branch<TNode>, message?: string): Branch<TNode>;
  /**
   * Create a merge commit.
   *
   * @param branchName Branch name
   * @param message Merge commit message
   */
  public merge(branchName: string, message?: string): Branch<TNode>;
  public merge(
    branch: string | Branch<TNode>,
    message?: string,
  ): Branch<TNode> {
    const branchName = typeof branch === "string" ? branch : branch.name;
    const parentCommitHash = this.gitgraph.refs.getCommit(branchName);
    if (!parentCommitHash) {
      throw new Error(`The branch called "${branchName}" is unknown`);
    }

    this.commit({
      subject: message || `Merge branch ${branchName}`,
      parents: [parentCommitHash],
    });

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
    this.gitgraph.tag(name, this.name);
    return this;
  }

  /**
   * Return true if branch was deleted.
   */
  public isDeleted(): boolean {
    return this.name === DELETED_BRANCH_NAME;
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
      tag: {
        ...withoutUndefinedKeys(this.gitgraph.template.commit.tag),
        ...withoutUndefinedKeys(this.commitDefaultOptions.style!.tag),
        ...style.tag,
      },
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
): Branch<TNode> {
  return new Branch({
    name: DELETED_BRANCH_NAME,
    gitgraph,
    style,
  });
}
