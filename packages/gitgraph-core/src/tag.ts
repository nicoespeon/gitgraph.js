import { TagStyle, CommitStyle, DEFAULT_FONT } from "./template";
import { numberOptionOr } from "./utils";

export { Tag };

class Tag {
  /**
   * Name
   */
  public readonly name: string;
  /**
   * Style
   */
  public get style(): TagStyle {
    return {
      strokeColor: this.tagStyle.strokeColor || this.commitStyle.color,
      bgColor: this.tagStyle.bgColor || this.commitStyle.color,
      color: this.tagStyle.color || "white",
      font: this.tagStyle.font || this.commitStyle.message.font || DEFAULT_FONT,
      borderRadius: numberOptionOr(this.tagStyle.borderRadius, 10),
      pointerWidth: numberOptionOr(this.tagStyle.pointerWidth, 12),
    };
  }

  private readonly tagStyle: Partial<TagStyle>;
  private readonly commitStyle: CommitStyle;

  constructor(
    name: string,
    tagStyle: Partial<TagStyle>,
    commitStyle: CommitStyle,
  ) {
    this.name = name;
    this.tagStyle = tagStyle;
    this.commitStyle = commitStyle;
  }
}
