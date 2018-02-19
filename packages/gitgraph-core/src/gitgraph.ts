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

  private commits: Commit[] = [];
  private refs = new Refs();
  private newBranchName: string | null = null;

  constructor(options?: GitGraphOptions) {
    this.options = { ...defaultGitGraphOptions, ...options };
    this.withRefs = this.withRefs.bind(this);
  }

  /**
   * Add refs info to on commit.
   * 
   * @param commit One commit
   */
  private withRefs(commit: Commit) {
    return {
      ...commit, refs: (this.refs.get(commit) as string[]) || []
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
   * @param options Options of the commit
   */
  public commit(options?: GitGraphCommitOptions | string): GitGraph {
    // Deal with shorter syntax
    if (typeof options === "string") options = { subject: options as string };
    if (!options) options = {};

    let parent;
    if (this.refs.has("HEAD")) {
      parent = this.refs.get("HEAD") as Commit;
      // Add the last commit as parent
      options.parent = parent.commit;
    }

    const commit = new Commit({
      author: this.options.author,
      subject: this.options.commitMessage as string,
      ...options
    });

    if (this.newBranchName) {
      // Create the new branch
      this.refs.set(this.newBranchName, commit);
      this.newBranchName = null;
    } else if (parent) {
      // Take all the refs from the parent
      const parentRefs = (this.refs.get(parent) || []) as string[];
      parentRefs.forEach(ref => this.refs.set(ref, commit));
    } else {
      // Set master as default branch name
      this.refs.set("master", commit);
    }

    // Add the new commit
    this.commits.push(commit);

    // Update HEAD
    this.refs.set("HEAD", commit);

    return this;
  }

  /**
   * Create a new branch.
   * 
   * @param name name of the created branch
   */
  public branch(name: string): GitGraph {
    this.newBranchName = name;
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

export default GitGraph;
