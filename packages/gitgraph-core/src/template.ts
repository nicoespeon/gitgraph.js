import Commit from "./commit";
import { booleanOptionOr, numberOptionOr } from "./utils";

/**
 * Branch merge style enum
 */
export enum MergeStyle {
  Bezier = "bezier",
  Straight = "straight",
}

/**
 * Arrow style
 */
export interface ArrowStyle {
  /**
   * Arrow color
   */
  color: string | null;
  /**
   * Arrow size in pixel
   */
  size: number | null;
  /**
   * Arrow offset in pixel
   */
  offset: number;
}

export type ArrowStyleOptions = Partial<ArrowStyle>;

export interface BranchStyle {
  /**
   * Branch color
   */
  color?: string;
  /**
   * Branch line width in pixel
   */
  lineWidth: number;
  /**
   * Branch line dash segments
   */
  lineDash: number[];
  /**
   * Branch merge style
   */
  mergeStyle: MergeStyle;
  /**
   * Space between branches
   */
  spacing: number;
  /**
   * Show branch label policy
   */
  showLabel: boolean;
  /**
   * Branch label color
   */
  labelColor: string | null;
  /**
   * Branch label font
   */
  labelFont: string;
  /**
   * Rotation angle of brach label
   */
  labelRotation?: number | null;
}

export type BranchStyleOptions = Partial<BranchStyle>;

export interface CommitDotStyle {
  /**
   * Commit dot color
   */
  color?: string;
  /**
   * Commit dot size in pixel
   */
  size: number;
  /**
   * Commit dot stroke width
   */
  strokeWidth: number | null;
  /**
   * Commit dot stroke color
   */
  strokeColor: string | null;
  /**
   * Commit dot line dash
   */
  lineDash?: number[];
}

export type CommitDotStyleOptions = Partial<CommitDotStyle>;

export interface CommitMessageStyle {
  /**
   * Commit message color
   */
  color?: string;
  /**
   * Commit message display policy
   */
  display: boolean;
  /**
   * Commit message author display policy
   */
  displayAuthor: boolean;
  /**
   * Commit message branch display policy
   */
  displayBranch: boolean;
  /**
   * Commit message hash display policy
   */
  displayHash: boolean;
  /**
   * Commit message font
   */
  font: string;
}

export type CommitMessageStyleOptions = Partial<CommitMessageStyle>;

export interface CommitTagStyle {
  /**
   * Commit tag color
   */
  color?: string;
  /**
   * Commit tag font
   */
  font?: string;
}

export type CommitTagStyleOptions = Partial<CommitTagStyle>;

export interface CommitStyleBase {
  /**
   * Spacing between commits
   */
  spacing: number;
  /**
   * Commit color (dot & message)
   */
  color?: string;
  /**
   * Tooltips policy
   */
  shouldDisplayTooltipsInCompactMode: boolean;
  /**
   * Additional width to be added to the calculated width
   */
  widthExtension?: number;
  /**
   * Formatter for the tooltip content
   */
  tooltipHTMLFormatter: ((commit: Commit) => HTMLBodyElement) | null;
}

export interface CommitStyle extends CommitStyleBase {
  /**
   * Commit message style
   */
  message: CommitMessageStyle;
  /**
   * Commit dot style
   */
  dot: CommitDotStyle;
  /**
   * Commit tag style
   */
  tag: CommitTagStyle;
}

export interface CommitStyleOptions extends Partial<CommitStyleBase> {
  /**
   * Commit message style
   */
  message?: CommitMessageStyleOptions;
  /**
   * Commit dot style
   */
  dot?: CommitDotStyleOptions;
  /**
   * Commit tag style
   */
  tag?: CommitTagStyleOptions;
}

export interface TemplateOptions {
  /**
   * Colors scheme: One color for each column
   */
  colors?: string[];
  /**
   * Arrow style
   */
  arrow?: ArrowStyleOptions;
  /**
   * Branch style
   */
  branch?: BranchStyleOptions;
  /**
   * Commit style
   */
  commit?: CommitStyleOptions;
}

/**
 * Gitgraph template
 *
 * Set of design rules for the rendering.
 */
export class Template {
  /**
   * Colors scheme: One color for each column
   */
  public colors: string[];
  /**
   * Arrow style
   */
  public arrow: ArrowStyle;
  /**
   * Branch style
   */
  public branch: BranchStyle;
  /**
   * Commit style
   */
  public commit: CommitStyle;

  constructor(options: TemplateOptions) {
    // Options
    options.branch = options.branch || {};
    options.arrow = options.arrow || {};
    options.commit = options.commit || {};
    options.commit.dot = options.commit.dot || {};
    options.commit.tag = options.commit.tag || {};
    options.commit.message = options.commit.message || {};

    // One color per column
    this.colors = options.colors || ["#6963FF", "#47E8D4", "#6BDB52", "#E84BA5", "#FFA657"];

    // Branch style
    this.branch = {
      color: options.branch.color,
      lineWidth: options.branch.lineWidth || 2,
      lineDash: options.branch.lineDash || [],
      showLabel: options.branch.showLabel || false,
      labelColor: options.branch.labelColor || null,
      labelFont: options.branch.labelFont || "normal 8pt Calibri",
      labelRotation: numberOptionOr(options.branch.labelRotation, null),
      mergeStyle: options.branch.mergeStyle || MergeStyle.Bezier,
      spacing: numberOptionOr(options.branch.spacing, 20) as number,
    };

    // Arrow style
    this.arrow = {
      size: options.arrow.size || null,
      color: options.arrow.color || null,
      offset: options.arrow.offset || 2,
    };

    // Commit style
    this.commit = {
      color: options.commit.color,
      spacing: numberOptionOr(options.commit.spacing, 25) as number,
      widthExtension: options.commit.widthExtension || 0,
      tooltipHTMLFormatter: options.commit.tooltipHTMLFormatter || null,
      shouldDisplayTooltipsInCompactMode: booleanOptionOr(options.commit.shouldDisplayTooltipsInCompactMode, true),
      dot: {
        color: options.commit.dot.color || options.commit.color,
        size: options.commit.dot.size || 3,
        strokeWidth: numberOptionOr(options.commit.dot.strokeWidth, null),
        strokeColor: options.commit.dot.strokeColor || null,
        lineDash: options.commit.dot.lineDash || this.branch.lineDash,
      },
      tag: {
        color: options.commit.tag.color || options.commit.color,
        font: options.commit.tag.font || options.commit.message.font || "normal 10pt Calibri",
      },
      message: {
        display: booleanOptionOr(options.commit.message.display, true),
        displayAuthor: booleanOptionOr(options.commit.message.displayAuthor, true),
        displayBranch: booleanOptionOr(options.commit.message.displayBranch, true),
        displayHash: booleanOptionOr(options.commit.message.displayHash, true),
        color: options.commit.message.color || options.commit.color,
        font: options.commit.message.font || "normal 12pt Calibri",
      },
    };
  }
}

/**
 * Black arrow template
 */
export const blackArrowTemplate = new Template({
  branch: {
    color: "#000000",
    lineWidth: 4,
    spacing: 50,
    mergeStyle: MergeStyle.Straight,
    labelRotation: 0,
  },
  commit: {
    spacing: 60,
    dot: {
      size: 12,
      strokeColor: "#000000",
      strokeWidth: 7,
    },
    message: {
      color: "black",
    },
  },
  arrow: {
    size: 16,
    offset: 2.5,
  },
});

/**
 * Metro template
 */
export const metroTemplate = new Template({
  colors: ["#979797", "#008fb5", "#f1c109"],
  branch: {
    lineWidth: 10,
    spacing: 50,
    labelRotation: 0,
  },
  commit: {
    spacing: 80,
    dot: {
      size: 14,
    },
    message: {
      font: "normal 14pt Arial",
    },
  },
});
