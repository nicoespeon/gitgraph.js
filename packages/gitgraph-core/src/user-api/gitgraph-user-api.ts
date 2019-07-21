import { TagStyle, TemplateOptions } from "../template";
import { Commit, CommitRenderOptions, CommitOptions } from "../commit";
import {
  Branch,
  BranchCommitDefaultOptions,
  BranchRenderOptions,
  DELETED_BRANCH_NAME,
} from "../branch";
import { GitgraphCore } from "../gitgraph";
import { Refs } from "../refs";
import { BranchUserApi } from "./branch-user-api";

export {
  GitgraphCommitOptions,
  GitgraphBranchOptions,
  GitgraphTagOptions,
  GitgraphUserApi,
};

interface GitgraphCommitOptions<TNode> extends CommitRenderOptions<TNode> {
  author?: string;
  subject?: string;
  body?: string;
  hash?: string;
  style?: TemplateOptions["commit"];
  dotText?: string;
  tag?: string;
  onClick?: (commit: Commit<TNode>) => void;
  onMessageClick?: (commit: Commit<TNode>) => void;
  onMouseOver?: (commit: Commit<TNode>) => void;
  onMouseOut?: (commit: Commit<TNode>) => void;
}

interface GitgraphTagOptions<TNode> {
  name: string;
  style?: TemplateOptions["tag"];
  ref?: Commit["hash"] | Branch["name"];
  render?: (name: string, style: TagStyle) => TNode;
}

interface GitgraphBranchOptions<TNode> extends BranchRenderOptions<TNode> {
  /**
   * Branch name
   */
  name: string;
  /**
   * Origin branch or commit hash
   */
  from?: BranchUserApi<TNode> | Commit["hash"];
  /**
   * Default options for commits
   */
  commitDefaultOptions?: BranchCommitDefaultOptions<TNode>;
  /**
   * Branch style
   */
  style?: TemplateOptions["branch"];
}

class GitgraphUserApi<TNode> {
  // tslint:disable:variable-name - Prefix `_` = explicitly private for JS users
  private _graph: GitgraphCore<TNode>;
  private _onGraphUpdate: () => void;
  // tslint:enable:variable-name

  constructor(graph: GitgraphCore<TNode>, onGraphUpdate: () => void) {
    this._graph = graph;
    this._onGraphUpdate = onGraphUpdate;
  }

  /**
   * Clear everything (as `rm -rf .git && git init`).
   */
  public clear(): this {
    this._graph.refs = new Refs();
    this._graph.tags = new Refs();
    this._graph.commits = [];
    this._graph.branches = new Map();
    this._graph.currentBranch = this._graph.createBranch("master");
    this._onGraphUpdate();
    return this;
  }

  /**
   * Add a new commit in the history (as `git commit`).
   *
   * @param subject Commit subject
   */
  public commit(subject?: string): this;
  /**
   * Add a new commit in the history (as `git commit`).
   *
   * @param options Options of the commit
   */
  public commit(options?: GitgraphCommitOptions<TNode>): this;
  public commit(options?: any): this {
    this._graph.currentBranch.getUserApi().commit(options);
    return this;
  }

  /**
   * Create a new branch (as `git branch`).
   *
   * @param options Options of the branch
   */
  public branch(options: GitgraphBranchOptions<TNode>): BranchUserApi<TNode>;
  /**
   * Create a new branch (as `git branch`).
   *
   * @param name Name of the created branch
   */
  public branch(name: string): BranchUserApi<TNode>;
  public branch(args: any): BranchUserApi<TNode> {
    return this._graph.createBranch(args).getUserApi();
  }

  /**
   * Tag a specific commit.
   *
   * @param options Options of the tag
   */
  public tag(options: GitgraphTagOptions<TNode>): this;
  /**
   * Tag a specific commit.
   *
   * @param name Name of the tag
   * @param ref Commit or branch name or commit hash
   */
  public tag(
    name: GitgraphTagOptions<TNode>["name"],
    ref?: GitgraphTagOptions<TNode>["ref"],
  ): this;
  public tag(...args: any[]): this {
    // Deal with shorter syntax
    let name: GitgraphTagOptions<TNode>["name"];
    let ref: GitgraphTagOptions<TNode>["ref"];
    let style: GitgraphTagOptions<TNode>["style"];
    let render: GitgraphTagOptions<TNode>["render"];

    if (typeof args[0] === "string") {
      name = args[0];
      ref = args[1];
    } else {
      name = args[0].name;
      ref = args[0].ref;
      style = args[0].style;
      render = args[0].render;
    }

    if (!ref) {
      const head = this._graph.refs.getCommit("HEAD");
      if (!head) return this;

      ref = head;
    }

    let commitHash;
    if (this._graph.refs.hasCommit(ref)) {
      // `ref` is a `Commit["hash"]`
      commitHash = ref;
    }

    if (this._graph.refs.hasName(ref)) {
      // `ref` is a `Branch["name"]`
      commitHash = this._graph.refs.getCommit(ref);
    }

    if (!commitHash) {
      throw new Error(`The ref "${ref}" does not exist`);
    }

    this._graph.tags.set(name, commitHash);
    this._graph.tagStyles[name] = style;
    this._graph.tagRenders[name] = render;
    this._onGraphUpdate();
    return this;
  }

  /**
   * Import a JSON.
   *
   * Data can't be typed since it comes from a JSON.
   * We validate input format and throw early if something is invalid.
   *
   * @experimental
   * @param data JSON from `git2json` output
   */
  public import(data: unknown) {
    const invalidData = new Error(
      "Only `git2json` format is supported for imported data.",
    );

    // We manually validate input data instead of using a lib like yup.
    // => this is to keep bundlesize small.

    if (!Array.isArray(data)) {
      throw invalidData;
    }

    const areDataValid = data.every((options) => {
      return (
        typeof options === "object" &&
        typeof options.author === "object" &&
        Array.isArray(options.refs)
      );
    });

    if (!areDataValid) {
      throw invalidData;
    }

    const commitOptionsList: Array<
      CommitOptions<TNode> & { refs: string[] }
    > = data
      .map((options) => ({
        ...options,
        style: {
          ...this._graph.template.commit,
          message: {
            ...this._graph.template.commit.message,
            display: this._graph.shouldDisplayCommitMessage,
          },
        },
        author: `${options.author.name} <${options.author.email}>`,
      }))
      // Git2json outputs is reverse-chronological.
      // We need to commit it chronological order.
      .reverse();

    // Use validated `value`.
    this.clear();

    this._graph.commits = commitOptionsList.map(
      (options) => new Commit(options),
    );

    // Create tags & refs.
    commitOptionsList.forEach(({ refs, hash }) => {
      if (!refs) return;
      if (!hash) return;

      const TAG_PREFIX = "tag: ";

      const tags = refs
        .map((ref) => ref.split(TAG_PREFIX))
        .map(([_, tag]) => tag)
        .filter((tag) => typeof tag === "string");
      tags.forEach((tag) => this._graph.tags.set(tag, hash));

      refs
        .filter((ref) => !ref.startsWith(TAG_PREFIX))
        .forEach((ref) => this._graph.refs.set(ref, hash));
    });

    // Create branches.
    const branches = this._getBranches();
    this._graph.commits
      .map((commit) => this._withBranches(branches, commit))
      .reduce((mem, commit) => {
        if (!commit.branches) return mem;
        commit.branches.forEach((branch) => mem.add(branch));
        return mem;
      }, new Set<Branch["name"]>())
      .forEach((branch) => this.branch(branch));

    this._onGraphUpdate();

    return this;
  }

  // tslint:disable:variable-name - Prefix `_` = explicitly private for JS users

  // TODO: get rid of these duplicated private methods.
  //
  // These belong to Gitgraph. It is duplicated because of `import()`.
  // `import()` should use regular user API instead.
  private _withBranches(
    branches: Map<Commit["hash"], Set<Branch["name"]>>,
    commit: Commit<TNode>,
  ): Commit<TNode> {
    let commitBranches = Array.from(
      (branches.get(commit.hash) || new Set()).values(),
    );

    if (commitBranches.length === 0) {
      // No branch => branch has been deleted.
      commitBranches = [DELETED_BRANCH_NAME];
    }

    return commit.setBranches(commitBranches);
  }

  private _getBranches(): Map<Commit["hash"], Set<Branch["name"]>> {
    const result = new Map<Commit["hash"], Set<Branch["name"]>>();

    const queue: Array<Commit["hash"]> = [];
    const branches = this._graph.refs
      .getAllNames()
      .filter((name) => name !== "HEAD");
    branches.forEach((branch) => {
      const commitHash = this._graph.refs.getCommit(branch);
      if (commitHash) {
        queue.push(commitHash);
      }

      while (queue.length > 0) {
        const currentHash = queue.pop() as Commit["hash"];
        const current = this._graph.commits.find(
          ({ hash }) => hash === currentHash,
        ) as Commit<TNode>;
        const prevBranches =
          result.get(currentHash) || new Set<Branch["name"]>();
        prevBranches.add(branch);
        result.set(currentHash, prevBranches);
        if (current.parents.length > 0) {
          queue.push(current.parents[0]);
        }
      }
    });

    return result;
  }

  // tslint:enable:variable-name
}
