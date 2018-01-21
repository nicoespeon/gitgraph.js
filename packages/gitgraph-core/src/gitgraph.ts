import { Commit } from "./commit";

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
  subject: string;
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

  private commits: Commit[] = [];

  constructor(options?: GitGraphOptions) {
    this.options = { ...defaultGitGraphOptions, ...options };
  }

  /**
   * Return the list of all commits (as `git log`).
   */
  public log(): Commit[] {
    return this.commits;
  }

  /**
   * Add a new commit in the history (as `git commit`).
   *
   * @param options Options of the commit
   */
  public commit(options: GitGraphCommitOptions | string): GitGraph {
    // Deal with shorter syntax
    if (typeof options === "string") options = { subject: options as string };

    if (this.commits.length) {
      const lastCommit = this.commits[this.commits.length - 1];
      // Update refs from precedent commit
      lastCommit.refs = [];
      // Add the last commit as parent
      options.parent = lastCommit.commit;
    }

    // Add the new commit
    this.commits.push(new Commit({
      author: this.options.author,
      subject: this.options.commitMessage,
      ...options,
      refs: ["master", "HEAD"],
    }));

    return this;
  }

  /**
   * Render the graph.
   *
   * It must be implemented by children.
   * This method is called on each graph modification.
   */
  public abstract render(): void;

}
