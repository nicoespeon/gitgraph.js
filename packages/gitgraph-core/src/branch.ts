import Commit from "./commit";
import { GitgraphCore, GitgraphCommitOptions } from "./gitgraph";
import { CommitStyle } from "./template";

export interface BranchCommitDefaultOptions {
  author?: string;
  subject?: string;
  style?: CommitStyle;
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
   * Parent commit
   */
  parentCommit?: Commit;
  /**
   * Default options for commits
   */
  commitDefaultOptions?: BranchCommitDefaultOptions;
}

/**
 * Branch
 */
export class Branch {
  public name: string;
  public commitDefaultOptions: BranchCommitDefaultOptions;

  private gitgraph: GitgraphCore;
  private parentCommit: Commit | undefined;

  /**
   * Branch constructor
   * @param options options
   */
  constructor(options: BranchOptions) {
    this.gitgraph = options.gitgraph;
    this.name = options.name;
    this.parentCommit = options.parentCommit;
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
      parentOnSameBranch = this.gitgraph.refs.get(this.name) as Commit;
      options.parents.unshift(parentOnSameBranch.hash);
    } else if (this.parentCommit) {
      options.parents.unshift(this.parentCommit.hash);
    }

    const { tag, ...commitOptions } = options;
    const commit = new Commit({
      author: this.commitDefaultOptions.author || this.gitgraph.author,
      subject: this.commitDefaultOptions.subject || this.gitgraph.commitMessage as string,
      ...commitOptions,
      style: this.getCommitStyle(options.style),
    });

    if (parentOnSameBranch) {
      // Take all the refs from the parent
      const parentRefs = (this.gitgraph.refs.get(parentOnSameBranch) || []) as string[];
      parentRefs.forEach((ref) => this.gitgraph.refs.set(ref, commit));
    } else {
      // Set the branch ref
      this.gitgraph.refs.set(this.name, commit);
    }

    // Add the new commit
    this.gitgraph.commits.push(commit);

    // Move HEAD on the last commit
    this.checkout();
    this.gitgraph.refs.set("HEAD", commit);

    // Add a tag to the commit if `option.tag` is provide
    if (tag) this.tag(tag);

    // Update the render
    this.gitgraph.render();

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
    const branchName = (typeof branch === "string") ? branch : branch.name;
    const parentCommit = this.gitgraph.refs.get(branchName) as Commit;
    if (!parentCommit) throw new Error(`The branch called "${branchName}" is unknown`);
    this.commit({ subject: `Merge branch ${branchName}`, parents: [parentCommit.hash] });
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
   * - template commit base
   * - branch override
   * - commit override
   * @param style
   */
  private getCommitStyle(style: CommitStyle = {}): CommitStyle {
    return {
      ...this.gitgraph.template.commit,
      ...this.commitDefaultOptions.style,
      ...style,
      tag: {
        ...this.gitgraph.template.commit.tag,
        ...(this.commitDefaultOptions.style as CommitStyle).tag,
        ...style.tag,
      },
      message: {
        ...this.gitgraph.template.commit.message,
        ...(this.commitDefaultOptions.style as CommitStyle).message,
        ...style.message,
      },
      dot: {
        ...this.gitgraph.template.commit.dot,
        ...(this.commitDefaultOptions.style as CommitStyle).dot,
        ...style.dot,
      },
    } as CommitStyle;
  }
}

export default Branch;
