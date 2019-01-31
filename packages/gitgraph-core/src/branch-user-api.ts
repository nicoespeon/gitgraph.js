import GitgraphCore, { Mode } from "./gitgraph";
import { GitgraphCommitOptions } from "./gitgraph-user-api";
import { CommitStyleOptions, CommitStyle } from "./template";
import Commit from "./commit";
import Branch from "./branch";
import { withoutUndefinedKeys } from "./utils";

interface BranchMergeOptions<TNode> {
  /**
   * Branch or branch name.
   */
  branch: string | BranchUserApi<TNode>;
  /**
   * Merge commit message subject.
   */
  subject?: string;
  /**
   * If `true`, perform a fast-forward merge (if possible).
   */
  fastForward?: boolean;
}

export class BranchUserApi<TNode> {
  /**
   * Name of the branch.
   * It needs to be public to be used when we merge another branch.
   */
  public readonly name: Branch["name"];

  private branch: Branch<TNode>;
  private graph: GitgraphCore<TNode>;
  private onGraphUpdate: () => void;

  constructor(
    branch: Branch<TNode>,
    graph: GitgraphCore<TNode>,
    onGraphUpdate: () => void,
  ) {
    this.branch = branch;
    this.name = branch.name;
    this.graph = graph;
    this.onGraphUpdate = onGraphUpdate;
  }

  /**
   * Add a new commit in the branch (as `git commit`).
   *
   * @param subject Commit subject
   */
  public commit(subject?: string): this;
  /**
   * Add a new commit in the branch (as `git commit`).
   *
   * @param options Options of the commit
   */
  public commit(options?: GitgraphCommitOptions<TNode>): this;
  public commit(options?: GitgraphCommitOptions<TNode> | string): this {
    // Deal with shorter syntax
    if (typeof options === "string") options = { subject: options };
    if (!options) options = {};

    this.commitWithParents(options, []);
    this.onGraphUpdate();

    return this;
  }

  /**
   * Create a merge commit.
   *
   * @param branch Branch
   * @param subject Merge commit message
   */
  public merge(branch: BranchUserApi<TNode>, subject?: string): this;
  /**
   * Create a merge commit.
   *
   * @param branchName Branch name
   * @param subject Merge commit message
   */
  public merge(branchName: string, subject?: string): this;
  /**
   * Create a merge commit.
   *
   * @param options Options of the merge
   */
  public merge(options: BranchMergeOptions<TNode>): this;
  public merge(...args: any[]): this {
    let options = args[0];
    if (!isBranchMergeOptions<TNode>(options)) {
      options = { branch: args[0], subject: args[1], fastForward: false };
    }
    const { branch, subject, fastForward } = options;

    const branchName = typeof branch === "string" ? branch : branch.name;
    const branchLastCommitHash = this.graph.refs.getCommit(branchName);
    if (!branchLastCommitHash) {
      throw new Error(`The branch called "${branchName}" is unknown`);
    }

    let canFastForward = false;
    const lastCommitHash = this.graph.refs.getCommit(this.branch.name);
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
   * Tag the last commit of the branch.
   *
   * @param name Name of the tag
   */
  public tag(name: string): this {
    this.graph.getUserApi().tag(name, this.branch.name);
    return this;
  }

  /**
   * Checkout onto this branch.
   */
  public checkout(): this {
    this.graph.currentBranch = this.branch;
    return this;
  }

  private commitWithParents(
    options: GitgraphCommitOptions<TNode>,
    parents: string[],
  ): void {
    const parentOnSameBranch = this.graph.refs.getCommit(this.branch.name);
    if (parentOnSameBranch) {
      parents.unshift(parentOnSameBranch);
    } else if (this.branch.parentCommitHash) {
      parents.unshift(this.branch.parentCommitHash);
    }

    const { tag, ...commitOptions } = options;
    const commit = new Commit({
      author: this.branch.commitDefaultOptions.author || this.graph.author,
      subject:
        this.branch.commitDefaultOptions.subject ||
        (this.graph.commitMessage as string),
      ...commitOptions,
      parents,
      style: this.getCommitStyle(options.style),
    });

    if (parentOnSameBranch) {
      // Take all the refs from the parent
      const parentRefs = this.graph.refs.getNames(parentOnSameBranch);
      parentRefs.forEach((ref) => this.graph.refs.set(ref, commit.hash));
    } else {
      // Set the branch ref
      this.graph.refs.set(this.branch.name, commit.hash);
    }

    // Add the new commit
    this.graph.commits.push(commit);

    // Move HEAD on the last commit
    this.checkout();
    this.graph.refs.set("HEAD", commit.hash);

    // Add a tag to the commit if `option.tag` is provide
    if (tag) this.tag(tag);
  }

  private areCommitsConnected(
    parentCommitHash: Commit["hash"],
    childCommitHash: Commit["hash"],
  ): boolean {
    const childCommit = this.graph.commits.find(
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
    this.graph.refs.set(this.branch.name, commitHash);
  }

  private getCommitStyle(style: CommitStyleOptions = {}): CommitStyle {
    const message = {
      ...withoutUndefinedKeys(this.graph.template.commit.message),
      ...withoutUndefinedKeys(this.branch.commitDefaultOptions.style!.message),
      ...style.message,
    };

    if (!this.graph.isVertical || this.graph.mode === Mode.Compact) {
      message.display = false;
    }

    return {
      ...withoutUndefinedKeys(this.graph.template.commit),
      ...withoutUndefinedKeys(this.branch.commitDefaultOptions.style),
      ...style,
      message,
      dot: {
        ...withoutUndefinedKeys(this.graph.template.commit.dot),
        ...withoutUndefinedKeys(this.branch.commitDefaultOptions.style!.dot),
        ...style.dot,
      },
    } as CommitStyle;
  }
}

function isBranchMergeOptions<TNode>(
  options: BranchMergeOptions<TNode> | any,
): options is BranchMergeOptions<TNode> {
  return typeof options === "object" && !(options instanceof BranchUserApi);
}
