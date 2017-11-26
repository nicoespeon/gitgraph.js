export interface BranchOptions {
  /**
   * GitGraph constructor
   */
  parent: any;
  /**
   * Parent branch
   */
  parentBranch?: Branch;
  /**
   * Parent commit
   */
  parentCommit: any;
  /**
   * Branch name
   */
  name?: string;
  /**
   * Branch line dash segments
   */
  lineDash?: number[];
  /**
   * Default options for commits
   */
  commitDefaultOptions?: any;
}

/**
 * Branch
 */
export class Branch {
  public options: BranchOptions;

  /**
   * Branch constructor
   * @param options options
   */
  constructor(options: BranchOptions) {
    this.options = options;
  }
}
