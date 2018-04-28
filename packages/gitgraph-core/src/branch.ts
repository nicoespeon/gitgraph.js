import Commit from "./commit";
import { GitgraphCore, GitgraphCommitOptions } from "./gitgraph";
import { CommitStyleOptions, CommitStyle, BranchStyle } from "./template";
import { withoutUndefinedKeys } from "./utils";

export interface BranchCommitDefaultOptions {
  author?: string;
  subject?: string;
  style?: CommitStyleOptions;
}

export interface BranchOptions {
  /**
   * Gitgraph constructor
   */
  gitgraph: GitgraphCore;
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
  commitDefaultOptions?: BranchCommitDefaultOptions;
}

/**
 * Branch
 */
export class Branch {
  public name: BranchOptions["name"];
  public style: BranchStyle;
  public commitDefaultOptions: BranchCommitDefaultOptions;

  private gitgraph: GitgraphCore;
  private parentCommitHash: BranchOptions["parentCommitHash"];

  /**
   * Branch constructor
   * @param options options
   */
  constructor(options: BranchOptions) {
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
  public commit(subject?: string): Branch;
  /**
   * Add a new commit in the branch (as `git commit`).
   *
   * @param options Options of the commit
   */
  public commit(options?: GitgraphCommitOptions): Branch;
  public commit(options?: GitgraphCommitOptions | string): Branch {
    // Deal with shorter syntax
    if (typeof options === "string") options = { subject: options as string };
    if (!options) options = {};

    let parentOnSameBranch;
    if (!options.parents) options.parents = [];
    if (this.gitgraph.refs.has(this.name)) {
      parentOnSameBranch = this.gitgraph.refs.get(this.name) as Commit["hash"];
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
      const parentRefs = (this.gitgraph.refs.get(parentOnSameBranch) ||
        []) as string[];
      parentRefs.forEach(ref => this.gitgraph.refs.set(ref, commit.hash));
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
   */
  public merge(branch: Branch): Branch;
  /**
   * Create a merge commit.
   *
   * @param branchName Branch name
   */
  public merge(branchName: string): Branch;
  public merge(branch: string | Branch): Branch {
    const branchName = typeof branch === "string" ? branch : branch.name;
    const parentCommitHash = this.gitgraph.refs.get(
      branchName,
    ) as Commit["hash"];
    if (!parentCommitHash)
      throw new Error(`The branch called "${branchName}" is unknown`);
    this.commit({
      subject: `Merge branch ${branchName}`,
      parents: [parentCommitHash],
    });
    return this;
  }

  /**
   * Checkout onto this branch
   */
  public checkout(): Branch {
    this.gitgraph.currentBranch = this;
    return this;
  }

  /**
   * Tag the last commit of the branch
   *
   * @param name Name of the tag
   */
  public tag(name: string): Branch {
    this.gitgraph.tag(name, this.name);
    return this;
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
    return {
      ...withoutUndefinedKeys({ color: this.style.color }),
      ...withoutUndefinedKeys(this.gitgraph.template.commit),
      ...withoutUndefinedKeys(this.commitDefaultOptions.style),
      ...style,
      tag: {
        ...withoutUndefinedKeys({ color: this.style.color }),
        ...withoutUndefinedKeys(this.gitgraph.template.commit.tag),
        ...withoutUndefinedKeys(this.commitDefaultOptions.style!.tag),
        ...style.tag,
      },
      message: {
        ...withoutUndefinedKeys({ color: this.style.color }),
        ...withoutUndefinedKeys(this.gitgraph.template.commit.message),
        ...withoutUndefinedKeys(this.commitDefaultOptions.style!.message),
        ...style.message,
      },
      dot: {
        ...withoutUndefinedKeys({ color: this.style.color }),
        ...withoutUndefinedKeys(this.gitgraph.template.commit.dot),
        ...withoutUndefinedKeys(this.commitDefaultOptions.style!.dot),
        ...style.dot,
      },
    } as CommitStyle;
  }
}

export default Branch;
