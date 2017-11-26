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
  author?: string;
}

const defaultGitGraphOptions: GitGraphOptions = {
  author: "Sergio Flores <saxo-guy@epic.com>",
  initCommitOffsetX: 0,
  initCommitOffsetY: 0,
  reverseArrow: false,
};

export class GitGraph {
  public options: GitGraphOptions;

  constructor(options?: GitGraphOptions) {
    this.options = { ...defaultGitGraphOptions, ...options };
  }
}
