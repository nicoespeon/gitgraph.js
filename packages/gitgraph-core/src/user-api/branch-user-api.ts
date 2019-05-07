import { GitgraphCore } from "../gitgraph";
import { Mode } from "../mode";
import {
  GitgraphCommitOptions,
  GitgraphBranchOptions,
  GitgraphTagOptions,
} from "./gitgraph-user-api";
import { TemplateOptions, CommitStyle } from "../template";
import { Commit } from "../commit";
import { Branch } from "../branch";
import { withoutUndefinedKeys, Omit } from "../utils";

export { BranchUserApi, GitgraphMergeOptions };

interface GitgraphMergeOptions<TNode> {
  /**
   * Branch or branch name.
   */
  branch: string | BranchUserApi<TNode>;
  /**
   * If `true`, perform a fast-forward merge (if possible).
   */
  fastForward?: boolean;
  /**
   * Commit options.
   */
  commitOptions?: GitgraphCommitOptions<TNode>;
}

type BranchTagOptions<TNode> = Omit<GitgraphTagOptions<TNode>, ["ref"]>;

class BranchUserApi<TNode> {
  /**
   * Name of the branch.
   * It needs to be public to be used when we merge another branch.
   */
  public readonly name: Branch["name"];

  // tslint:disable:variable-name - Prefix `_` = explicitly private for JS users
  private _branch: Branch<TNode>;
  private _graph: GitgraphCore<TNode>;
  private _onGraphUpdate: () => void;
  // tslint:enable:variable-name

  constructor(
    branch: Branch<TNode>,
    graph: GitgraphCore<TNode>,
    onGraphUpdate: () => void,
  ) {
    this._branch = branch;
    this.name = branch.name;
    this._graph = graph;
    this._onGraphUpdate = onGraphUpdate;
  }

  /**
   * Create a new branch (as `git branch`).
   *
   * @param options Options of the branch
   */
  public branch(
    options: Omit<GitgraphBranchOptions<TNode>, "from">,
  ): BranchUserApi<TNode>;
  /**
   * Create a new branch (as `git branch`).
   *
   * @param name Name of the created branch
   */
  public branch(name: string): BranchUserApi<TNode>;
  public branch(args: any): BranchUserApi<TNode> {
    const options: GitgraphBranchOptions<TNode> =
      typeof args === "string" ? { name: args } : args;

    options.from = this;

    return this._graph.createBranch(options).getUserApi();
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

    this._commitWithParents(options, []);
    this._onGraphUpdate();

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
  public merge(options: GitgraphMergeOptions<TNode>): this;
  public merge(...args: any[]): this {
    let options = args[0];
    if (!isBranchMergeOptions<TNode>(options)) {
      options = {
        branch: args[0],
        fastForward: false,
        commitOptions: { subject: args[1] },
      };
    }
    const {
      branch,
      fastForward,
      commitOptions,
    } = options as GitgraphMergeOptions<TNode>;

    const branchName = typeof branch === "string" ? branch : branch.name;
    const branchLastCommitHash = this._graph.refs.getCommit(branchName);
    if (!branchLastCommitHash) {
      throw new Error(`The branch called "${branchName}" is unknown`);
    }

    let canFastForward = false;
    const lastCommitHash = this._graph.refs.getCommit(this._branch.name);
    if (lastCommitHash) {
      canFastForward = this._areCommitsConnected(
        lastCommitHash,
        branchLastCommitHash,
      );
    } else {
      canFastForward = false;
    }

    if (fastForward && canFastForward) {
      this._fastForwardTo(branchLastCommitHash);
    } else {
      this._commitWithParents(
        {
          ...commitOptions,
          subject:
            (commitOptions && commitOptions.subject) ||
            `Merge branch ${branchName}`,
        },
        [branchLastCommitHash],
      );
    }

    this._onGraphUpdate();
    return this;
  }

  /**
   * Tag the last commit of the branch.
   *
   * @param options Options of the tag
   */
  public tag(options: BranchTagOptions<TNode>): this;
  /**
   * Tag the last commit of the branch.
   *
   * @param name Name of the tag
   */
  public tag(name: BranchTagOptions<TNode>["name"]): this;
  public tag(options?: any): this {
    if (typeof options === "string") {
      this._graph.getUserApi().tag({ name: options, ref: this._branch.name });
    } else {
      this._graph.getUserApi().tag({ ...options, ref: this._branch.name });
    }

    return this;
  }

  /**
   * Checkout onto this branch.
   */
  public checkout(): this {
    this._graph.currentBranch = this._branch;
    return this;
  }

  // tslint:disable:variable-name - Prefix `_` = explicitly private for JS users

  private _commitWithParents(
    options: GitgraphCommitOptions<TNode>,
    parents: string[],
  ): void {
    const parentOnSameBranch = this._graph.refs.getCommit(this._branch.name);
    if (parentOnSameBranch) {
      parents.unshift(parentOnSameBranch);
    } else if (this._branch.parentCommitHash) {
      parents.unshift(this._branch.parentCommitHash);
    }

    const { tag, ...commitOptions } = options;
    const commit = new Commit({
      hash: this._graph.generateCommitHash(),
      author: this._branch.commitDefaultOptions.author || this._graph.author,
      subject:
        this._branch.commitDefaultOptions.subject ||
        (this._graph.commitMessage as string),
      ...commitOptions,
      parents,
      style: this._getCommitStyle(options.style),
    });

    if (parentOnSameBranch) {
      // Take all the refs from the parent
      const parentRefs = this._graph.refs.getNames(parentOnSameBranch);
      parentRefs.forEach((ref) => this._graph.refs.set(ref, commit.hash));
    } else {
      // Set the branch ref
      this._graph.refs.set(this._branch.name, commit.hash);
    }

    // Add the new commit
    this._graph.commits.push(commit);

    // Move HEAD on the last commit
    this.checkout();
    this._graph.refs.set("HEAD", commit.hash);

    // Add a tag to the commit if `option.tag` is provide
    if (tag) this.tag(tag);
  }

  private _areCommitsConnected(
    parentCommitHash: Commit["hash"],
    childCommitHash: Commit["hash"],
  ): boolean {
    const childCommit = this._graph.commits.find(
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
      this._areCommitsConnected(parentCommitHash, directParentHash),
    );
  }

  private _fastForwardTo(commitHash: Commit["hash"]): void {
    this._graph.refs.set(this._branch.name, commitHash);
  }

  private _getCommitStyle(style: TemplateOptions["commit"] = {}): CommitStyle {
    const message = {
      ...withoutUndefinedKeys(this._graph.template.commit.message),
      ...withoutUndefinedKeys(this._branch.commitDefaultOptions.style!.message),
      ...style.message,
    };

    if (this._graph.isHorizontal || this._graph.mode === Mode.Compact) {
      message.display = false;
    }

    return {
      ...withoutUndefinedKeys(this._graph.template.commit),
      ...withoutUndefinedKeys(this._branch.commitDefaultOptions.style),
      ...style,
      message,
      dot: {
        ...withoutUndefinedKeys(this._graph.template.commit.dot),
        ...withoutUndefinedKeys(this._branch.commitDefaultOptions.style!.dot),
        ...style.dot,
      },
    } as CommitStyle;
  }

  // tslint:enable:variable-name
}

function isBranchMergeOptions<TNode>(
  options: GitgraphMergeOptions<TNode> | any,
): options is GitgraphMergeOptions<TNode> {
  return typeof options === "object" && !(options instanceof BranchUserApi);
}
