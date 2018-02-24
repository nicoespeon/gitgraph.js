import Branch, { BranchOptions, BranchCommitDefaultOptions } from "./branch";
import Commit from "./commit";
import { Template, metroTemplate, blackArrowTemplate, CommitStyle } from "./template";
import Refs from "./refs";

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
  author: string;
  commitMessage?: string;
}

export interface GitGraphCommitOptions {
  author?: string;
  subject?: string;
  body?: string;
  notes?: string;
  refs?: string[];
  tree?: string;
  commit?: string;
  parent?: string;
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

const defaultGitGraphOptions: GitGraphOptions = {
  template: metroTemplate,
  author: "Sergio Flores <saxo-guy@epic.com>",
  commitMessage: "He doesn't like George Michael! Boooo!",
  initCommitOffsetX: 0,
  initCommitOffsetY: 0,
  reverseArrow: false,
};

export abstract class GitGraph {
  public options: GitGraphOptions;
  public template: Template;
  public refs = new Refs();
  public commits: Commit[] = [];
  public currentBranch: Branch;

  constructor(options?: GitGraphOptions) {
    this.options = { ...defaultGitGraphOptions, ...options };
    this.withRefs = this.withRefs.bind(this);
    this.currentBranch = new Branch({ name: "master", gitgraph: this });

    // Resolve template
    if (typeof this.options.template === "string") {
      this.template = {
        [TemplateEnum.BlackArrow]: blackArrowTemplate,
        [TemplateEnum.Metro]: metroTemplate,
      }[this.options.template];
    } else {
      this.template = this.options.template as Template;
    }
  }

  /**
   * Return the list of all commits (as `git log`).
   */
  public log(): Commit[] {
    return this.commits.map(this.withRefs);
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
   * Add refs info to on commit.
   *
   * @param commit One commit
   */
  private withRefs(commit: Commit) {
    return {
      ...commit, refs: (this.refs.get(commit) as string[]) || [],
    };
  }
}

export default GitGraph;
