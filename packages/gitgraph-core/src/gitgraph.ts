import Branch, { BranchOptions, BranchCommitDefaultOptions } from "./branch";
import Commit from "./commit";
import { Template, metroTemplate, blackArrowTemplate, CommitStyle } from "./template";
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

export interface GitGraphOptions {
  template?: TemplateEnum | Template;
  orientation?: OrientationsEnum;
  reverseArrow?: boolean;
  initCommitOffsetX?: number;
  initCommitOffsetY?: number;
  mode?: ModeEnum;
  author?: string;
  commitMessage?: string;
}

export interface GitGraphCommitOptions {
  author?: string;
  subject?: string;
  body?: string;
  notes?: string;
  refs?: string[];
  tree?: string;
  hash?: string;
  parents?: string[];
  style?: CommitStyle;
  innerText?: string;
}

export interface GitGraphBranchOptions {
  /**
   * Branch name
   */
  name: string;
  /**
   * Default options for commits
   */
  commitDefaultOptions?: BranchCommitDefaultOptions;
}

export abstract class GitGraph {
  public orientation?: OrientationsEnum;
  public reverseArrow: boolean;
  public initCommitOffsetX: number;
  public initCommitOffsetY: number;
  public mode?: ModeEnum;
  public author: string;
  public commitMessage: string;
  public template: Template;

  public refs = new Refs();
  public commits: Commit[] = [];
  public currentBranch: Branch;

  constructor(options: GitGraphOptions = {}) {
    // Set a default `master` branch
    this.currentBranch = new Branch({ name: "master", gitgraph: this });

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

    // Set all options with default values
    this.orientation = options.orientation;
    this.reverseArrow = booleanOptionOr(options.reverseArrow, false);
    this.initCommitOffsetX = numberOptionOr(options.initCommitOffsetX, 0) as number;
    this.initCommitOffsetY = numberOptionOr(options.initCommitOffsetY, 0) as number;
    this.mode = options.mode;
    this.author = options.author || "Sergio Flores <saxo-guy@epic.com>";
    this.commitMessage = options.commitMessage || "He doesn't like George Michael! Boooo!";

    // Context binding
    this.withRefs = this.withRefs.bind(this);
    this.withPosition = this.withPosition.bind(this);
    this.withBranches = this.withBranches.bind(this);
  }

  /**
   * Return the list of all commits (as `git log`).
   */
  public log(): Commit[] {
    // 1. Add `refs` to each commit
    const commitsWithRefs = this.commits.map(this.withRefs);

    // 2. Add `branches` to each commit
    const commitsWithRefsAndBranches = this.withBranches(commitsWithRefs);

    // 3. Add position to each commit
    return commitsWithRefsAndBranches.map(this.withPosition);
  }

  /**
   * Add a new commit in the history (as `git commit`).
   *
   * @param subject Commit subject
   */
  public commit(subject?: string): GitGraph;
  /**
   * Add a new commit in the history (as `git commit`).
   *
   * @param options Options of the commit
   */
  // tslint:disable-next-line:unified-signatures
  public commit(options?: GitGraphCommitOptions): GitGraph;
  public commit(options?: any): GitGraph {
    this.currentBranch.commit(options);
    return this;
  }

  /**
   * Create a new branch. (as `git branch`)
   *
   * @param options options of the branch
   */
  public branch(options: GitGraphBranchOptions): Branch;
  /**
   * Create a new branch. (as `git branch`)
   *
   * @param name name of the created branch
   */
  // tslint:disable-next-line:unified-signatures
  public branch(name: string): Branch;
  public branch(args: any): Branch {
    const parentCommit = this.refs.get("HEAD") as Commit;
    let options: BranchOptions = { gitgraph: this, name: "", parentCommit };
    if (typeof args === "string") {
      options.name = args;
    } else {
      options = { ...options, ...args };
    }
    const branch = new Branch(options);

    return branch;
  }

  /**
   * Render the graph.
   *
   * It must be implemented by children.
   * This method is called on each graph modification.
   */
  public abstract render(): void;

  /**
   * Add refs info to one commit.
   *
   * Note: the `commit` must be the original object from `this.commits`
   * due to the direct reference into `this.refs`
   *
   * @param commit One commit
   */
  private withRefs(commit: Commit) {
    return {
      ...commit, refs: (this.refs.get(commit) as string[]) || [],
    };
  }

  /**
   * Add `branches` property to commits.
   *
   * @param commits List of commits
   */
  private withBranches(commits: Commit[]): Commit[] {
    const branches = this.refs.branches();
    const refs = new Map<Commit["hash"], Array<Branch["name"]>>();
    branches.forEach((branch: string) => {
      const lastCommit = this.refs.get(branch) as Commit;
      const currentBranches = refs.get(lastCommit.hash) || [];
      refs.set(lastCommit.hash, [...currentBranches, branch]);

      let parent = commits.find(({ hash }) => hash === lastCommit.parents[0]);
      while (parent) {
        const currentParentBranches = refs.get(parent.hash) || [];
        refs.set(parent.hash, [...currentParentBranches, branch]);
        parent = commits.find(({ hash }) => hash === (parent as Commit).parents[0]);
      }
    });

    return commits.map((commit) => ({ ...commit, branches: refs.get(commit.hash) }));
  }

  /**
   * Add position to one commit.
   *
   * Note: You need to have `commit.branches` set in each commit before this.
   *
   * @param commit One commit
   * @param i index
   */
  private withPosition(commit: Commit, i: number, arr: Commit[]): Commit {
    const { length } = arr;
    const column = (commit.branches || [])[0] === "master" ? 0 : 1;
    switch (this.orientation) {
      default:
        return {
          ...commit,
          x: this.initCommitOffsetX + this.template.branch.spacing * column,
          y: this.initCommitOffsetY + this.template.commit.spacing * (length - 1 - i),
        };

      case OrientationsEnum.VerticalReverse:
        return {
          ...commit,
          x: this.initCommitOffsetX + this.template.branch.spacing * column,
          y: this.initCommitOffsetY + this.template.commit.spacing * i,
        };

      case OrientationsEnum.Horizontal:
        return {
          ...commit,
          x: this.initCommitOffsetX + this.template.commit.spacing * i,
          y: this.initCommitOffsetY + this.template.branch.spacing * column,
        };

      case OrientationsEnum.HorizontalReverse:
        return {
          ...commit,
          x: this.initCommitOffsetX + this.template.commit.spacing * (length - 1 - i),
          y: this.initCommitOffsetY + this.template.branch.spacing * column,
        };
    }
  }
}

export default GitGraph;
