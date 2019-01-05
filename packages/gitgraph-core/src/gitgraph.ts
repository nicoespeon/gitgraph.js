import * as yup from "yup";

import Branch, { BranchOptions, BranchCommitDefaultOptions } from "./branch";
import Commit, { CommitRenderOptions, CommitOptions } from "./commit";
import { createGraphRows } from "./graph-rows";
import {
  Template,
  TemplateName,
  CommitStyleOptions,
  BranchStyleOptions,
  getTemplate,
} from "./template";
import Refs from "./refs";
import { booleanOptionOr, numberOptionOr, pick } from "./utils";
import { Orientation } from "./orientation";

export enum Mode {
  Compact = "compact",
}

export interface Coordinate {
  x: number;
  y: number;
}

interface InternalCoordinate extends Coordinate {
  mergeCommit?: boolean;
}

export interface GitgraphOptions {
  template?: TemplateName | Template;
  orientation?: Orientation;
  reverseArrow?: boolean;
  initCommitOffsetX?: number;
  initCommitOffsetY?: number;
  mode?: Mode;
  author?: string;
  commitMessage?: string;
}

export interface RenderedData<TNode> {
  commits: Array<Commit<TNode>>;
  branchesPaths: Map<Branch<TNode>, Coordinate[][]>;
  commitMessagesX: number;
}

export interface GitgraphCommitOptions<TNode = SVGElement>
  extends CommitRenderOptions<TNode> {
  author?: string;
  subject?: string;
  body?: string;
  refs?: string[];
  tree?: string;
  hash?: string;
  parents?: string[];
  style?: CommitStyleOptions;
  innerText?: string;
  tag?: string;
  onClick?: (commit: Commit<TNode>) => void;
  onMessageClick?: (commit: Commit<TNode>) => void;
  onMouseOver?: (commit: Commit<TNode>) => void;
  onMouseOut?: (commit: Commit<TNode>) => void;
}

export interface GitgraphBranchOptions<TNode> {
  /**
   * Branch name
   */
  name: string;
  /**
   * Default options for commits
   */
  commitDefaultOptions?: BranchCommitDefaultOptions<TNode>;
  /**
   * Branch style
   */
  style?: BranchStyleOptions;
}

type BranchesPaths<TNode> = Map<Branch<TNode>, InternalCoordinate[]>;

const DELETED_BRANCH_NAME = "";

function getDeletedBranchInPath<TNode>(
  branchesPaths: BranchesPaths<TNode>,
): Branch<TNode> | undefined {
  return Array.from(branchesPaths.keys()).find(
    ({ name }) => name === DELETED_BRANCH_NAME,
  );
}

export class GitgraphCore<TNode = SVGElement> {
  public orientation?: Orientation;
  public isVertical: boolean;
  public reverseArrow: boolean;
  public initCommitOffsetX: number;
  public initCommitOffsetY: number;
  public mode?: Mode;
  public author: string;
  public commitMessage: string;
  public template: Template;

  public refs = new Refs();
  public tags = new Refs();
  public commits: Array<Commit<TNode>> = [];
  public branches: Map<Branch["name"], Branch<TNode>> = new Map();
  public currentBranch: Branch<TNode>;

  private columns: Array<Branch["name"]> = [];
  private listeners: Array<() => void> = [];

  constructor(options: GitgraphOptions = {}) {
    this.template = getTemplate(options.template);

    // Set a default `master` branch
    this.currentBranch = this.branch("master");

    // Set all options with default values
    this.orientation = options.orientation;
    this.isVertical = [
      undefined, // default value = Vertical
      Orientation.VerticalReverse,
    ].includes(this.orientation);
    this.reverseArrow = booleanOptionOr(options.reverseArrow, false);
    this.initCommitOffsetX = numberOptionOr(
      options.initCommitOffsetX,
      0,
    ) as number;
    this.initCommitOffsetY = numberOptionOr(
      options.initCommitOffsetY,
      0,
    ) as number;
    this.mode = options.mode;
    this.author = options.author || "Sergio Flores <saxo-guy@epic.com>";
    this.commitMessage =
      options.commitMessage || "He doesn't like George Michael! Boooo!";
  }

  /**
   * Get rendered data of each commits and branches paths.
   */
  public getRenderedData(): RenderedData<TNode> {
    let commits = this.commits
      .map((commit) => commit.setRefs(this.refs))
      .map((commit) => commit.setTags(this.tags));

    commits = this.withBranches(commits)
      .map((commit) => commit.computeBranchToDisplay())
      .map((commit) => this.withPosition(commits, commit))
      .map(this.setDefaultColor.bind(this));

    // Compute branches paths.
    const emptyBranchesPaths = new Map<Branch<TNode>, InternalCoordinate[]>();
    const branchesPathsFromCommits = commits.reduce((result, commit) => {
      const firstParentCommit = commits.find(
        ({ hash }) => hash === commit.parents[0],
      );
      return this.setBranchPathForCommit(result, commit, firstParentCommit);
    }, emptyBranchesPaths);
    const branchesPaths = this.smoothBranchesPaths(
      this.branchesPathsWithMergeCommits(commits, branchesPathsFromCommits),
    );

    // Compute branch color
    Array.from(branchesPaths).forEach(([branch], i) => {
      const defaultColor = this.template.colors[
        i % this.template.colors.length
      ];
      branch.computedColor = branch.style.color || defaultColor;
    });

    // Compute messages position
    const numberOfColumns = Array.from(branchesPaths).length;
    const commitMessagesX = numberOfColumns * this.template.branch.spacing;

    return { commits, branchesPaths, commitMessagesX };
  }

  /**
   * Add a new commit in the history (as `git commit`).
   *
   * @param subject Commit subject
   */
  public commit(subject?: string): GitgraphCore<TNode>;
  /**
   * Add a new commit in the history (as `git commit`).
   *
   * @param options Options of the commit
   */
  public commit(options?: GitgraphCommitOptions<TNode>): GitgraphCore<TNode>;
  public commit(options?: any): GitgraphCore<TNode> {
    this.currentBranch.commit(options);
    return this;
  }

  /**
   * Create a new branch. (as `git branch`)
   *
   * @param options options of the branch
   */
  public branch(options: GitgraphBranchOptions<TNode>): Branch<TNode>;
  /**
   * Create a new branch. (as `git branch`)
   *
   * @param name name of the created branch
   */
  public branch(name: string): Branch<TNode>;
  public branch(args: any): Branch<TNode> {
    const parentCommitHash = this.refs.getCommit("HEAD");
    let options: BranchOptions<TNode> = {
      gitgraph: this,
      name: "",
      parentCommitHash,
      style: this.template.branch,
    };
    if (typeof args === "string") {
      options.name = args;
    } else {
      options = { ...options, ...args };
    }
    const branch = new Branch<TNode>(options);
    this.branches.set(branch.name, branch);

    return branch;
  }

  /**
   * Clear everything. (as `rm -rf .git && git init`)
   */
  public clear(): GitgraphCore<TNode> {
    this.refs = new Refs();
    this.tags = new Refs();
    this.commits = [];
    this.columns = [];
    this.branches = new Map();
    this.currentBranch = this.branch("master");
    this.next();
    return this;
  }

  /**
   * Tag a specific commit. (as `git tag`)
   *
   * @param name Name of the tag
   * @param ref Commit or branch name or commit hash
   */
  public tag(
    name: string,
    ref?: Commit<TNode> | Commit["hash"] | Branch["name"],
  ): GitgraphCore<TNode> {
    if (!ref) {
      const head = this.refs.getCommit("HEAD");
      if (!head) return this;

      ref = head;
    }

    if (typeof ref !== "string") {
      // `ref` is a `Commit`
      this.tags.set(name, ref.hash);
      this.next();
      return this;
    }

    let commitHash;
    if (this.refs.hasCommit(ref)) {
      // `ref` is a `Commit["hash"]`
      commitHash = ref;
    }

    if (this.refs.hasName(ref)) {
      // `ref` is a `Branch["name"]`
      commitHash = this.refs.getCommit(ref);
    }

    if (!commitHash) {
      throw new Error(`The ref "${ref}" does not exist`);
    }

    this.tags.set(name, commitHash);
    this.next();
    return this;
  }

  /**
   * Add a change listener.
   * It will be called any time the graph have changed (commit, merge…).
   *
   * @param listener A callback to be invoked on every change.
   * @returns A function to remove this change listener.
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);

    let isSubscribed = true;

    return () => {
      if (!isSubscribed) return;
      isSubscribed = false;
      const index = this.listeners.indexOf(listener);
      this.listeners.splice(index, 1);
    };
  }

  /**
   * Called on each graph modification.
   */
  public next() {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Import a JSON.
   *
   * Data can't be typed since it comes from a JSON.
   * We validate input format and throw early if something is invalid.
   *
   * @param data JSON from `git2json` output
   */
  public import(data: any) {
    // Validate `data` format.
    const schema = yup.array().of(
      yup.object({
        refs: yup.array().of(yup.string()),
        hash: yup.string(),
        parents: yup.array().of(yup.string()),
        author: yup.object({
          name: yup.string(),
          email: yup.string(),
        }),
        subject: yup.string(),
        body: yup.string(),
      }),
    );

    const commitOptionsList: Array<CommitOptions<TNode>> = schema
      .validateSync(data)
      .map((options) => ({
        ...options,
        style: { ...this.template.commit },
        author: `${options.author.name} <${options.author.email}>`,
      }))
      // Git2json outputs is reverse-chronological.
      // We need to commit it chronological order.
      .reverse();

    // Use validated `value`.
    this.clear();

    this.commits = commitOptionsList.map((options) => new Commit(options));

    // Create tags & refs.
    this.commits.forEach(({ refs, hash }) => {
      const TAG_PREFIX = "tag: ";

      const tags = refs
        .map((ref) => ref.split(TAG_PREFIX))
        .map(([_, tag]) => tag)
        .filter((tag) => typeof tag === "string");
      tags.forEach((tag) => this.tags.set(tag, hash));

      refs
        .filter((ref) => !ref.startsWith(TAG_PREFIX))
        .forEach((ref) => this.refs.set(ref, hash));
    });

    // Create branches.
    this.withBranches(this.commits)
      .reduce((mem, { branches }) => {
        if (!branches) return mem;
        branches.forEach((branch) => mem.add(branch));
        return mem;
      }, new Set())
      .forEach((branch) => this.branch(branch));

    this.next();

    return this;
  }

  /**
   * Add `branches` property to commits.
   *
   * @param commits List of commits
   */
  private withBranches(commits: Array<Commit<TNode>>): Array<Commit<TNode>> {
    const branches = this.refs.getAllNames().filter((name) => name !== "HEAD");
    const refs = new Map<Commit["hash"], Set<Branch["name"]>>();
    const queue: Array<Commit["hash"]> = [];
    branches.forEach((branch) => {
      const commitHash = this.refs.getCommit(branch);
      if (commitHash) {
        queue.push(commitHash);
      }

      while (queue.length > 0) {
        const currentHash = queue.pop() as Commit["hash"];
        const current = commits.find(
          ({ hash }) => hash === currentHash,
        ) as Commit<TNode>;
        const prevBranches = refs.get(currentHash) || new Set<Branch["name"]>();
        prevBranches.add(branch);
        refs.set(currentHash, prevBranches);
        if (current.parents.length > 0) {
          queue.push(current.parents[0]);
        }
      }
    });

    return commits.map((commit) => {
      let commitBranches = Array.from(
        (refs.get(commit.hash) || new Set()).values(),
      );

      if (commitBranches.length === 0) {
        // No branch => branch has been deleted.
        commitBranches = [DELETED_BRANCH_NAME];
      }

      return commit.setBranches(commitBranches);
    });
  }

  /**
   * Set default color to one commit.
   *
   * @param commit One commit
   */
  private setDefaultColor(commit: Commit<TNode>): Commit<TNode> {
    const column = this.columns.findIndex(
      (col) => col === commit.branchToDisplay,
    );
    const defaultColor = this.template.colors[
      column % this.template.colors.length
    ];

    return commit.setDefaultColor(defaultColor);
  }

  /**
   * Add position to one commit.
   *
   * Functional requirements:
   *  - You need to have `commit.branchToDisplay` set in each commit. (without merge commits resolution)
   *
   * @param commits All commits
   * @param commit One commit
   */
  private withPosition(
    commits: Array<Commit<TNode>>,
    commit: Commit<TNode>,
  ): Commit<TNode> {
    const rows = createGraphRows(this.mode, commits);
    const row = rows.getRowOf(commit.hash);
    const maxRow = rows.getMaxRow();

    // Resolve branch's column index
    const branch = commit.branchToDisplay!;
    if (!this.columns.includes(branch)) this.columns.push(branch);
    const column = this.columns.findIndex((col) => col === branch);

    switch (this.orientation) {
      default:
        return commit.setPosition({
          x: this.initCommitOffsetX + this.template.branch.spacing * column,
          y:
            this.initCommitOffsetY +
            this.template.commit.spacing * (maxRow - row),
        });

      case Orientation.VerticalReverse:
        return commit.setPosition({
          x: this.initCommitOffsetX + this.template.branch.spacing * column,
          y: this.initCommitOffsetY + this.template.commit.spacing * row,
        });

      case Orientation.Horizontal:
        return commit.setPosition({
          x: this.initCommitOffsetX + this.template.commit.spacing * row,
          y: this.initCommitOffsetY + this.template.branch.spacing * column,
        });

      case Orientation.HorizontalReverse:
        return commit.setPosition({
          x:
            this.initCommitOffsetX +
            this.template.commit.spacing * (maxRow - row),
          y: this.initCommitOffsetY + this.template.branch.spacing * column,
        });
    }
  }

  /**
   * Create or update the path of the branch corresponding to given commit.
   *
   * @param branchesPaths Map of all branches paths
   * @param commit Current commit
   * @param firstParentCommit First parent of the commit
   */
  private setBranchPathForCommit(
    branchesPaths: BranchesPaths<TNode>,
    commit: Commit<TNode>,
    firstParentCommit: Commit<TNode> | undefined,
  ): BranchesPaths<TNode> {
    if (!commit.branches) {
      return branchesPaths;
    }

    // Sometimes `branchToDisplay` is not computed => fallback on first branch.
    // Some "import" scenarios show that.
    // There might be something to fix here.
    let branch = this.branches.get(
      commit.branchToDisplay || commit.branches[0],
    );

    // Branch was deleted.
    if (!branch) {
      const deletedBranchInPath = getDeletedBranchInPath<TNode>(branchesPaths);

      // NB: may not work properly if there are many deleted branches.
      if (deletedBranchInPath) {
        branch = deletedBranchInPath;
      } else {
        branch = new Branch({
          name: DELETED_BRANCH_NAME,
          gitgraph: this,
          style: this.template.branch,
        });
      }
    }

    const path: Coordinate[] = [];
    const existingBranchPath = branchesPaths.get(branch);
    if (existingBranchPath) {
      path.push(...existingBranchPath);
    } else if (firstParentCommit) {
      // Make branch path starts from parent branch (parent commit).
      path.push({ x: firstParentCommit.x, y: firstParentCommit.y });
    }

    path.push({ x: commit.x, y: commit.y });

    branchesPaths.set(branch, path);
    return branchesPaths;
  }

  /**
   * Insert merge commits points into `branchesPaths`.
   *
   * @example
   *     // Before
   *     [
   *       { x: 0, y: 640 },
   *       { x: 50, y: 560 }
   *     ]
   *
   *     // After
   *     [
   *       { x: 0, y: 640 },
   *       { x: 50, y: 560 },
   *       { x: 50, y: 560, mergeCommit: true }
   *     ]
   *
   * @param commits All commits (with all branches resolved)
   * @param branchesPaths Map of coordinates of each branch
   */
  private branchesPathsWithMergeCommits(
    commits: Array<Commit<TNode>>,
    branchesPaths: BranchesPaths<TNode>,
  ): BranchesPaths<TNode> {
    const mergeCommits = commits.filter(({ parents }) => parents.length > 1);

    mergeCommits.forEach((mergeCommit) => {
      const parentOnOriginBranch = commits.find(({ hash }) => {
        return hash === mergeCommit.parents[1];
      });
      if (!parentOnOriginBranch) return;

      const originBranchName = parentOnOriginBranch.refs[0];
      let branch = this.branches.get(originBranchName);

      if (!branch) {
        // Branch may have been deleted.
        const deletedBranchInPath = getDeletedBranchInPath<TNode>(
          branchesPaths,
        );

        if (!deletedBranchInPath) {
          return;
        }

        branch = deletedBranchInPath;
      }

      const lastPoints = [...(branchesPaths.get(branch) || [])];
      branchesPaths.set(branch, [
        ...lastPoints,
        { x: mergeCommit.x, y: mergeCommit.y, mergeCommit: true },
      ]);
    });

    return branchesPaths;
  }

  /**
   * Smooth all paths by putting points on each row.
   *
   * @param flatBranchesPaths Map of coordinates of each branch
   */
  private smoothBranchesPaths(
    flatBranchesPaths: BranchesPaths<TNode>,
  ): Map<Branch<TNode>, Coordinate[][]> {
    const branchesPaths = new Map<Branch<TNode>, Coordinate[][]>();

    flatBranchesPaths.forEach((points, branch) => {
      if (points.length <= 1) {
        branchesPaths.set(branch, [points]);
        return;
      }

      // Cut path on each merge commits
      // Coordinate[] -> Coordinate[][]
      if (this.isVertical) {
        points = points.sort((a, b) => (a.y > b.y ? -1 : 1));
      } else {
        points = points.sort((a, b) => (a.x > b.x ? 1 : -1));
      }

      const paths = points.reduce<Coordinate[][]>(
        (mem, point, i) => {
          if (point.mergeCommit) {
            mem[mem.length - 1].push(pick(point, ["x", "y"]));
            if (points[i - 1]) mem.push([points[i - 1]]);
          } else {
            mem[mem.length - 1].push(point);
          }
          return mem;
        },
        [[]],
      );

      // Add intermediate points on each sub paths
      if (this.isVertical) {
        paths.forEach((subPath) => {
          if (subPath.length <= 1) return;
          const firstPoint = subPath[0];
          const lastPoint = subPath[subPath.length - 1];
          const column = subPath[1].x;
          const branchSize =
            Math.round(
              Math.abs(firstPoint.y - lastPoint.y) /
                this.template.commit.spacing,
            ) - 1;
          const branchPoints =
            branchSize > 0
              ? new Array(branchSize).fill(0).map((_, i) => ({
                  x: column,
                  y: subPath[0].y - this.template.commit.spacing * (i + 1),
                }))
              : [];
          const lastSubPaths = branchesPaths.get(branch) || [];
          branchesPaths.set(branch, [
            ...lastSubPaths,
            [firstPoint, ...branchPoints, lastPoint],
          ]);
        });
      } else {
        paths.forEach((subPath) => {
          if (subPath.length <= 1) return;
          const firstPoint = subPath[0];
          const lastPoint = subPath[subPath.length - 1];
          const column = subPath[1].y;
          const branchSize =
            Math.round(
              Math.abs(firstPoint.x - lastPoint.x) /
                this.template.commit.spacing,
            ) - 1;
          const branchPoints =
            branchSize > 0
              ? new Array(branchSize).fill(0).map((_, i) => ({
                  y: column,
                  x: subPath[0].x + this.template.commit.spacing * (i + 1),
                }))
              : [];
          const lastSubPaths = branchesPaths.get(branch) || [];
          branchesPaths.set(branch, [
            ...lastSubPaths,
            [firstPoint, ...branchPoints, lastPoint],
          ]);
        });
      }
    });

    return branchesPaths;
  }
}

export default GitgraphCore;
