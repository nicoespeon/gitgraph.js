import Branch from "./branch";
import Commit from "./commit";
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
  template?: TemplateEnum;
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
}

const defaultGitGraphOptions: GitGraphOptions = {
  author: "Sergio Flores <saxo-guy@epic.com>",
  commitMessage: "He doesn't like George Michael! Boooo!",
  initCommitOffsetX: 0,
  initCommitOffsetY: 0,
  reverseArrow: false,
};

export abstract class GitGraph {
  public options: GitGraphOptions;
  public refs = new Refs();
  public commits: Commit[] = [];
  public currentBranch: Branch;

  constructor(options?: GitGraphOptions) {
    this.options = { ...defaultGitGraphOptions, ...options };
    this.withRefs = this.withRefs.bind(this);
    this.currentBranch = new Branch({ name: "master", gitgraph: this });
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
   * @param options Options of the commit
   */
  public commit(options?: GitGraphCommitOptions | string): GitGraph {
    this.currentBranch.commit(options);
    return this;
  }

  /**
   * Create a new branch. (as `git branch`)
   *
   * @param name name of the created branch
   */
  public branch(name: string): Branch {
    const parentCommit = this.refs.get("HEAD") as Commit;
    const branch = new Branch({ gitgraph: this, name, parentCommit });

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
