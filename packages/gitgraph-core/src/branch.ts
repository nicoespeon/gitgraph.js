import { GitGraph, GitGraphCommitOptions } from "./gitgraph";
import Commit from "./commit";

export interface BranchOptions {
  /**
   * GitGraph constructor
   */
  gitgraph: GitGraph;
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
  commitDefaultOptions?: any;
}

/**
 * Branch
 */
export class Branch {
  public name: string;
  public commitDefaultOptions: any;

  private gitgraph: GitGraph;
  private parentCommit: Commit | undefined;

  /**
   * Branch constructor
   * @param options options
   */
  constructor(options: BranchOptions) {
    this.gitgraph = options.gitgraph;
    this.name = options.name;
    this.parentCommit = options.parentCommit;
    // TODO deal with this default commit options
    this.commitDefaultOptions = options.commitDefaultOptions;
  }

  /**
   * Add a new commit in the branch (as `git commit`).
   *
   * @param options Options of the commit
   */
  public commit(options?: GitGraphCommitOptions | string): Branch {
    // Deal with shorter syntax
    if (typeof options === "string") options = { subject: options as string };
    if (!options) options = {};

    let parentOnSameBranch;
    if (this.gitgraph.refs.has(this.name)) {
      parentOnSameBranch = this.gitgraph.refs.get(this.name) as Commit;
      options.parent = parentOnSameBranch.commit;
    } else if (this.parentCommit) {
      options.parent = this.parentCommit.commit;
    }

    const commit = new Commit({
      author: this.gitgraph.options.author,
      subject: this.gitgraph.options.commitMessage as string,
      ...options
    });

    if (parentOnSameBranch) {
      // Take all the refs from the parent
      const parentRefs = (this.gitgraph.refs.get(parentOnSameBranch) || []) as string[];
      parentRefs.forEach(ref => this.gitgraph.refs.set(ref, commit));
    } else {
      // Set the branch ref
      this.gitgraph.refs.set(this.name, commit);
    }

    // Add the new commit
    this.gitgraph.commits.push(commit);

    // Move HEAD if we are on the current branch
    if (this.gitgraph.currentBranch === this) {
      this.gitgraph.refs.set("HEAD", commit);
    }

    return this;
  }
}

export default Branch;
