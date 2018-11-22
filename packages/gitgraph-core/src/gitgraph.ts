import * as yup from "yup";

import Branch, { BranchOptions, BranchCommitDefaultOptions } from "./branch";
import Commit, { CommitRenderOptions } from "./commit";
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
  notes?: string;
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
  private rows: Map<Commit["hash"], number> = new Map();
  private maxRow: number = 0;
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

    // Context binding
    this.withRefsAndTags = this.withRefsAndTags.bind(this);
    this.withPosition = this.withPosition.bind(this);
    this.withColor = this.withColor.bind(this);
    this.withBranches = this.withBranches.bind(this);
    this.calculateRows = this.calculateRows.bind(this);
    this.initBranchesPaths = this.initBranchesPaths.bind(this);
    this.addMergeCommitsIntoBranchesPaths = this.addMergeCommitsIntoBranchesPaths.bind(
      this,
    );
  }

  /**
   * Get rendered data of each commits and branches paths.
   */
  public getRenderedData(): RenderedData<TNode> {
    let commits = this.commits.map(this.withRefsAndTags);
    commits = this.withBranches(commits, { firstParentOnly: true });
    this.calculateRows(commits);
    commits = commits
      .map(this.withBranchToDisplay)
      .map(this.withPosition)
      .map(this.withColor);
    const flatBranchesPaths = commits.reduce(
      this.initBranchesPaths,
      new Map<Branch<TNode>, InternalCoordinate[]>(),
    );
    commits = this.withBranches(commits);
    this.addMergeCommitsIntoBranchesPaths(commits, flatBranchesPaths);
    const branchesPaths = this.smoothBranchesPaths(flatBranchesPaths);

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
    const parentCommitHash = this.refs.get("HEAD") as Commit["hash"];
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
    ref: Commit<TNode> | Commit["hash"] | Branch["name"] = this.refs.get(
      "HEAD",
    ) as Commit["hash"],
  ): GitgraphCore<TNode> {
    if (typeof ref === "string") {
      const commitHashOrRefs = this.refs.get(ref);
      if (!commitHashOrRefs) {
        throw new Error("this ref not exists");
      } else if (typeof commitHashOrRefs === "object") {
        // `ref` is a `Commit["hash"]`
        this.tags.set(name, ref);
      } else {
        // `ref` is a `Branch["name"]`
        this.tags.set(name, commitHashOrRefs);
      }
    } else {
      // `ref` is a `Commit`
      this.tags.set(name, ref.hash);
    }
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
        refs: yup.array(),
        hash: yup.string(),
        hashAbbrev: yup.string(),
        parents: yup.array().of(yup.string()),
        parentsAbbrev: yup.array().of(yup.string()),
        author: yup.object({
          name: yup.string(),
          email: yup.string(),
        }),
        subject: yup.string(),
        body: yup.string(),
      }),
    );

    const commits = schema.validateSync(data) as Array<Commit<TNode>>;

    // Use validated `value`.
    this.clear();

    this.commits = commits.map((commit) => {
      const TAG_PREFIX = "tag: ";
      const tags = commit.refs
        .map((ref) => ref.split(TAG_PREFIX))
        .map(([_, tag]) => tag)
        .filter((tag) => typeof tag === "string");
      tags.forEach((tag) => this.tags.set(tag, commit.hash));

      commit.refs
        .filter((ref) => !ref.startsWith(TAG_PREFIX))
        .forEach((ref) => this.refs.set(ref, commit.hash));

      return { ...commit, style: this.template.commit };
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
   * Add refs and tags info to one commit.
   *
   * Note: the `commit` must be the original object from `this.commits`
   * due to the direct reference into `this.refs` and `this.tags`
   *
   * @param commit One commit
   */
  private withRefsAndTags(commit: Commit<TNode>): Commit<TNode> {
    return {
      ...commit,
      refs: (this.refs.get(commit.hash) as string[]) || [],
      tags: (this.tags.get(commit.hash) as string[]) || [],
    };
  }

  /**
   * Add `branches` property to commits.
   *
   * @param commits List of commits
   * @param options
   * @param options.firstParentOnly Resolve the first parent of merge commit only
   */
  private withBranches(
    commits: Array<Commit<TNode>>,
    { firstParentOnly } = { firstParentOnly: false },
  ): Array<Commit<TNode>> {
    const branches = Array.from(this.refs)
      .filter(([key, value]) => typeof value === "string" && key !== "HEAD")
      .map(([key]) => key);
    const refs = new Map<Commit["hash"], Set<Branch["name"]>>();
    const queue: Array<Commit["hash"]> = [];
    branches.forEach((branch: string) => {
      queue.push(this.refs.get(branch) as Commit["hash"]);

      while (queue.length > 0) {
        const currentHash = queue.pop() as Commit["hash"];
        const current = commits.find(
          ({ hash }) => hash === currentHash,
        ) as Commit<TNode>;
        const prevBranches = refs.get(currentHash) || new Set<Branch["name"]>();
        prevBranches.add(branch);
        refs.set(currentHash, prevBranches);
        if (current.parents.length > 0) {
          firstParentOnly
            ? queue.push(current.parents[0])
            : queue.push(...current.parents);
        }
      }
    });

    return commits.map((commit) => ({
      ...commit,
      branches: Array.from((refs.get(commit.hash) || new Set()).values()),
    }));
  }

  /**
   * Calculate row index for each commit
   *
   * It's set directly into `this.rows` and `this.maxRow`
   * @param commits
   */
  private calculateRows(commits: Array<Commit<TNode>>): void {
    // Reset values
    this.rows = new Map<Commit["hash"], number>();
    this.maxRow = 0;

    // Attribute a row index to each commit
    commits.forEach(
      (commit, i): any => {
        if (this.mode === Mode.Compact) {
          // Compact mode
          if (i === 0) return this.rows.set(commit.hash, i);
          const parentRow: number = this.rows.get(commit.parents[0]) as number;
          const historyParent: Commit<TNode> = commits[i - 1];
          let newRow = Math.max(parentRow + 1, this.rows.get(
            historyParent.hash,
          ) as number);
          const isMergeCommit = commit.parents.length > 1;
          if (isMergeCommit) {
            // Push commit to next row to avoid collision when the branch in which
            // the merge happens has more commits than the merged branch.
            const mergeTargetParentRow: number = this.rows.get(
              commit.parents[1],
            ) as number;
            if (parentRow < mergeTargetParentRow) newRow++;
          }
          this.rows.set(commit.hash, newRow);
          this.maxRow = Math.max(this.maxRow, newRow + 1);
        } else {
          // Normal mode
          this.rows.set(commit.hash, i);
          this.maxRow = Math.max(this.maxRow, i + 1);
        }
      },
    );
  }

  /**
   * Add final color to one commit.
   *
   * It merge this.template.colors and commit colors override.
   *
   * @param commit One commit
   */
  private withColor(commit: Commit<TNode>): Commit<TNode> {
    // Retrieve branch's column index
    const branch = (commit.branches as Array<Branch["name"]>)[0];
    const column = this.columns.findIndex((col) => col === branch);
    const defaultColor = this.template.colors[
      column % this.template.colors.length
    ];

    return {
      ...commit,
      style: {
        ...commit.style,
        color: commit.style.color || defaultColor,
        tag: {
          ...commit.style.tag,
          color: commit.style.tag.color || defaultColor,
        },
        dot: {
          ...commit.style.dot,
          color: commit.style.dot.color || defaultColor,
        },
        message: {
          ...commit.style.message,
          color: commit.style.message.color || defaultColor,
        },
      },
    };
  }

  /**
   * Add branch to display to one commit.
   *
   * Functional requirements:
   *  - You need to have `commit.branches` set in each commit. (without merge commits resolution)
   *
   * @param commit One commit
   */
  private withBranchToDisplay(commit: Commit<TNode>): Commit<TNode> {
    return {
      ...commit,
      branchToDisplay: (commit.branches as Array<Branch["name"]>)[0],
    };
  }

  /**
   * Add position to one commit.
   *
   * Functional requirements:
   *  - You need to have `commit.branches` set in each commit. (without merge commits resolution)
   *  - You need to have `this.rows` and `this.maxRow` set.
   *
   * @param commit One commit
   */
  private withPosition(commit: Commit<TNode>): Commit<TNode> {
    // Resolve branch's column index
    const branch = (commit.branches as Array<Branch["name"]>)[0];
    if (!this.columns.includes(branch)) this.columns.push(branch);
    const column = this.columns.findIndex((col) => col === branch);

    // Resolve row index
    const row = this.rows.get(commit.hash) as number;

    switch (this.orientation) {
      default:
        return {
          ...commit,
          x: this.initCommitOffsetX + this.template.branch.spacing * column,
          y:
            this.initCommitOffsetY +
            this.template.commit.spacing * (this.maxRow - 1 - row),
        };

      case Orientation.VerticalReverse:
        return {
          ...commit,
          x: this.initCommitOffsetX + this.template.branch.spacing * column,
          y: this.initCommitOffsetY + this.template.commit.spacing * row,
        };

      case Orientation.Horizontal:
        return {
          ...commit,
          x: this.initCommitOffsetX + this.template.commit.spacing * row,
          y: this.initCommitOffsetY + this.template.branch.spacing * column,
        };

      case Orientation.HorizontalReverse:
        return {
          ...commit,
          x:
            this.initCommitOffsetX +
            this.template.commit.spacing * (this.maxRow - 1 - row),
          y: this.initCommitOffsetY + this.template.branch.spacing * column,
        };
    }
  }

  /**
   * First step to build `branchesPaths`
   * This add every "key points" in the branches (start point, commits positions)
   *
   * @param branchesPaths Map of coordinates of each branch
   * @param commit Current commit
   * @param index
   * @param commits All commits (with only the first branch resolve)
   */
  private initBranchesPaths(
    branchesPaths: Map<Branch<TNode>, InternalCoordinate[]>,
    commit: Commit<TNode>,
    index: number,
    commits: Array<Commit<TNode>>,
  ): Map<Branch<TNode>, InternalCoordinate[]> {
    const branch = this.branches.get(
      (commit.branches as Array<Branch["name"]>)[0],
    ) as Branch<TNode>;

    if (branchesPaths.has(branch)) {
      branchesPaths.set(branch, [
        ...(branchesPaths.get(branch) as Coordinate[]),
        { x: commit.x, y: commit.y },
      ]);
    } else {
      if (commit.parents[0]) {
        // We are on a branch -> include the parent commit in the path
        const parentCommit = commits.find(
          ({ hash }) => hash === commit.parents[0],
        ) as Commit<TNode>;
        branchesPaths.set(branch, [
          { x: parentCommit.x, y: parentCommit.y },
          { x: commit.x, y: commit.y },
        ]);
      } else {
        // We are on master
        branchesPaths.set(branch, [{ x: commit.x, y: commit.y }]);
      }
    }

    return branchesPaths;
  }

  /**
   * Second step to build `branchesPaths`.
   *
   * @param commits All commits (with all branches resolved)
   * @param branchesPaths Map of coordinates of each branch
   */
  private addMergeCommitsIntoBranchesPaths(
    commits: Array<Commit<TNode>>,
    branchesPaths: Map<Branch<TNode>, InternalCoordinate[]>,
  ) {
    const mergeCommits = commits.filter(({ parents }) => parents.length > 1);

    mergeCommits.forEach((mergeCommit) => {
      const parentOnOriginBranch = commits.find(({ hash }) => {
        return hash === mergeCommit.parents[1];
      });
      if (!parentOnOriginBranch) return;

      // This may not always be true.If you have a better solution, go ahead!
      const originBranchName = parentOnOriginBranch.branches![1];
      const branch = this.branches.get(originBranchName);
      if (!branch) return;

      const lastPoints = [...(branchesPaths.get(branch) || [])];
      branchesPaths.set(branch, [
        ...lastPoints,
        { x: mergeCommit.x, y: mergeCommit.y, mergeCommit: true },
      ]);
    });
  }

  /**
   * Smooth all paths by putting points on each row.
   *
   * @param flatBranchesPaths Map of coordinates of each branch
   */
  private smoothBranchesPaths(
    flatBranchesPaths: Map<Branch<TNode>, InternalCoordinate[]>,
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
