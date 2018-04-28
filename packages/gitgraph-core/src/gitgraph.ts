import Branch, { BranchOptions, BranchCommitDefaultOptions } from "./branch";
import Commit from "./commit";
import {
  Template,
  metroTemplate,
  blackArrowTemplate,
  CommitStyleOptions,
  BranchStyleOptions,
} from "./template";
import Refs from "./refs";
import { booleanOptionOr, numberOptionOr } from "./utils";

export enum OrientationsEnum {
  VerticalReverse = "vertical-reverse",
  Horizontal = "horizontal",
  HorizontalReverse = "horizontal-reverse",
}

export enum ModeEnum {
  Compact = "compact",
}

export enum TemplateEnum {
  Metro = "metro",
  BlackArrow = "blackarrow",
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface GitgraphOptions {
  template?: TemplateEnum | Template;
  orientation?: OrientationsEnum;
  reverseArrow?: boolean;
  initCommitOffsetX?: number;
  initCommitOffsetY?: number;
  mode?: ModeEnum;
  author?: string;
  commitMessage?: string;
}

export interface RenderedData {
  commits: Commit[];
  branchesPaths: Map<Branch, Coordinate[]>;
}

export interface GitgraphCommitOptions {
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
}

export interface GitgraphBranchOptions {
  /**
   * Branch name
   */
  name: string;
  /**
   * Default options for commits
   */
  commitDefaultOptions?: BranchCommitDefaultOptions;
  /**
   * Branch style
   */
  style?: BranchStyleOptions;
}

export class GitgraphCore {
  public orientation?: OrientationsEnum;
  public reverseArrow: boolean;
  public initCommitOffsetX: number;
  public initCommitOffsetY: number;
  public mode?: ModeEnum;
  public author: string;
  public commitMessage: string;
  public template: Template;

  public refs = new Refs();
  public tags = new Refs();
  public commits: Commit[] = [];
  public branches: Map<Branch["name"], Branch> = new Map();
  public currentBranch: Branch;

  private columns: Array<Branch["name"]> = [];
  private rows: Map<Commit["hash"], number> = new Map();
  private maxRow: number = 0;
  private listeners: Array<() => void> = [];

  constructor(options: GitgraphOptions = {}) {
    // Resolve template
    if (typeof options.template === "string") {
      this.template = {
        [TemplateEnum.BlackArrow]: blackArrowTemplate,
        [TemplateEnum.Metro]: metroTemplate,
      }[options.template];
    } else if (options.template) {
      this.template = options.template as Template;
    } else {
      this.template = metroTemplate;
    }

    // Set a default `master` branch
    this.currentBranch = this.branch("master");

    // Set all options with default values
    this.orientation = options.orientation;
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
  public getRenderedData(): RenderedData {
    let commits = this.commits.map(this.withRefsAndTags);
    commits = this.withBranches(commits, { firstParentOnly: true });
    this.calculateRows(commits);
    commits = commits.map(this.withPosition).map(this.withColor);
    const branchesPaths = commits.reduce(
      this.initBranchesPaths,
      new Map<Branch, Coordinate[]>(),
    );
    commits = this.withBranches(commits);
    this.addMergeCommitsIntoBranchesPaths(commits, branchesPaths);
    this.smoothBranchesPaths(branchesPaths);
    return { commits, branchesPaths };
  }

  /**
   * Add a new commit in the history (as `git commit`).
   *
   * @param subject Commit subject
   */
  public commit(subject?: string): GitgraphCore;
  /**
   * Add a new commit in the history (as `git commit`).
   *
   * @param options Options of the commit
   */
  public commit(options?: GitgraphCommitOptions): GitgraphCore;
  public commit(options?: any): GitgraphCore {
    this.currentBranch.commit(options);
    return this;
  }

  /**
   * Create a new branch. (as `git branch`)
   *
   * @param options options of the branch
   */
  public branch(options: GitgraphBranchOptions): Branch;
  /**
   * Create a new branch. (as `git branch`)
   *
   * @param name name of the created branch
   */
  public branch(name: string): Branch;
  public branch(args: any): Branch {
    const parentCommitHash = this.refs.get("HEAD") as Commit["hash"];
    let options: BranchOptions = {
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
    const branch = new Branch(options);
    this.branches.set(branch.name, branch);

    return branch;
  }

  /**
   * Clear everything. (as `rm -rf .git && git init`)
   */
  public clear(): GitgraphCore {
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
   * @param name Name of the tage
   * @param ref Commit or branch name or commit hash
   */
  public tag(
    name: string,
    ref: Commit | Commit["hash"] | Branch["name"] = this.refs.get(
      "HEAD",
    ) as Commit["hash"],
  ): GitgraphCore {
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
    this.listeners.forEach(listener => listener());
  }

  /**
   * Add refs and tags info to one commit.
   *
   * Note: the `commit` must be the original object from `this.commits`
   * due to the direct reference into `this.refs` and `this.tags`
   *
   * @param commit One commit
   */
  private withRefsAndTags(commit: Commit): Commit {
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
    commits: Commit[],
    { firstParentOnly } = { firstParentOnly: false },
  ): Commit[] {
    const branches = Array.from(this.refs)
      .filter(([key, value]) => typeof value === "string" && key !== "HEAD")
      .map(([key]) => key);
    const refs = new Map<Commit["hash"], Set<Branch["name"]>>();
    const queue: Array<Commit["hash"]> = [];
    branches.forEach((branch: string) => {
      queue.push(this.refs.get(branch) as Commit["hash"]);

      while (queue.length > 0) {
        const currentHash = queue.pop() as Commit["hash"];
        // TODO: convert commits to a Map<Commit["hash"], Commit>
        const current = commits.find(
          ({ hash }) => hash === currentHash,
        ) as Commit;
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

    return commits.map(commit => ({
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
  private calculateRows(commits: Commit[]): void {
    // Reset values
    this.rows = new Map<Commit["hash"], number>();
    this.maxRow = 0;

    // Attribute a row index to each commit
    commits.forEach((commit, i): any => {
      if (this.mode === ModeEnum.Compact) {
        // Compact mode
        if (i === 0) return this.rows.set(commit.hash, i);
        const parentRow: number = this.rows.get(commit.parents[0]) as number;
        const historyParent: Commit = commits[i - 1];
        let newRow = Math.max(parentRow + 1, this.rows.get(
          historyParent.hash,
        ) as number);
        if (commit.parents.length > 1) newRow++; // Merge case
        this.rows.set(commit.hash, newRow);
        this.maxRow = Math.max(this.maxRow, newRow + 1);
      } else {
        // Normal mode
        this.rows.set(commit.hash, i);
        this.maxRow = Math.max(this.maxRow, i + 1);
      }
    });
  }

  /**
   * Add final color to one commit.
   *
   * It merge this.template.colors and commit colors override.
   *
   * @param commit One commit
   */
  private withColor(commit: Commit): Commit {
    // Retrieve branch's column index
    const branch = (commit.branches as Array<Branch["name"]>)[0];
    const column = this.columns.findIndex(col => col === branch);
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
   * Add position to one commit.
   *
   * Functional requirements:
   *  - You need to have `commit.branches` set in each commit. (without merge commits resolution)
   *  - You need to have `this.rows` and `this.maxRow` set.
   *
   * @param commit One commit
   */
  private withPosition(commit: Commit): Commit {
    // Resolve branch's column index
    const branch = (commit.branches as Array<Branch["name"]>)[0];
    if (!this.columns.includes(branch)) this.columns.push(branch);
    const column = this.columns.findIndex(col => col === branch);

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

      case OrientationsEnum.VerticalReverse:
        return {
          ...commit,
          x: this.initCommitOffsetX + this.template.branch.spacing * column,
          y: this.initCommitOffsetY + this.template.commit.spacing * row,
        };

      case OrientationsEnum.Horizontal:
        return {
          ...commit,
          x: this.initCommitOffsetX + this.template.commit.spacing * row,
          y: this.initCommitOffsetY + this.template.branch.spacing * column,
        };

      case OrientationsEnum.HorizontalReverse:
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
    branchesPaths: Map<Branch, Coordinate[]>,
    commit: Commit,
    index: number,
    commits: Commit[],
  ): Map<Branch, Coordinate[]> {
    const branch = this.branches.get(
      (commit.branches as Array<Branch["name"]>)[0],
    ) as Branch;

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
        ) as Commit;
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
   * Second step to build `branchesPaths`
   *
   * @param commits All commits (with all branches resolves)
   * @param branchesPaths Map of coordinates of each branch
   */
  private addMergeCommitsIntoBranchesPaths(
    commits: Commit[],
    branchesPaths: Map<Branch, Coordinate[]>,
  ) {
    const mergeCommits = commits.filter(({ parents }) => parents.length > 1);
    mergeCommits.forEach(commit => {
      const branch = this.branches.get(
        ((commits.find(({ hash }) => hash === commit.parents[1]) as Commit)
          .branches as string[])[1],
      ) as Branch;
      branchesPaths.set(branch, [
        ...(branchesPaths.get(branch) as Coordinate[]),
        { x: commit.x, y: commit.y },
      ]);
    });
  }

  /**
   * Smooth all paths by putting points on each row.
   *
   * @param branchesPaths Map of coordinates of each branch
   */
  private smoothBranchesPaths(branchesPaths: Map<Branch, Coordinate[]>) {
    branchesPaths.forEach((points, branch) => {
      if (points.length <= 1) return;
      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      const column = points[1].x;
      const branchSize =
        Math.round(
          Math.abs(firstPoint.y - lastPoint.y) / this.template.commit.spacing,
        ) - 1;
      const branchPoints =
        branchSize > 0
          ? new Array(branchSize).fill(0).map((_, i) => ({
              x: column,
              y: points[0].y - this.template.commit.spacing * (i + 1),
            }))
          : [];
      branchesPaths.set(branch, [firstPoint, ...branchPoints, lastPoint]);
    });
  }
}

export default GitgraphCore;
