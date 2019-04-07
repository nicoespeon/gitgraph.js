import { booleanOptionOr, numberOptionOr } from "./utils";

export {
  MergeStyle,
  ArrowStyle,
  BranchStyle,
  CommitDotStyle,
  CommitMessageStyle,
  CommitStyleBase,
  CommitStyle,
  TemplateOptions,
  Template,
  TemplateName,
  blackArrowTemplate,
  metroTemplate,
  templateExtend,
  getTemplate,
};

/**
 * Branch merge style enum
 */
enum MergeStyle {
  Bezier = "bezier",
  Straight = "straight",
}

/**
 * Arrow style
 */
interface ArrowStyle {
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

type ArrowStyleOptions = Partial<ArrowStyle>;

interface BranchStyle {
  /**
   * Branch color
   */
  color?: string;
  /**
   * Branch line width in pixel
   */
  lineWidth: number;
  /**
   * Branch merge style
   */
  mergeStyle: MergeStyle;
  /**
   * Space between branches
   */
  spacing: number;
  /**
   * Branch label style
   */
  label: BranchLabelStyleOptions;
}

type BranchStyleOptions = Partial<BranchStyle>;

interface BranchLabelStyle {
  /**
   * Branch label visibility
   */
  display: boolean;
  /**
   * Branch label text color
   */
  color: string;
  /**
   * Branch label stroke color
   */
  strokeColor: string;
  /**
   * Branch label background color
   */
  bgColor: string;
  /**
   * Branch label font
   */
  font: string;
  /**
   * Branch label border radius
   */
  borderRadius: number;
}

type BranchLabelStyleOptions = Partial<BranchLabelStyle>;

export interface TagStyle {
  /**
   * Tag text color
   */
  color: string;
  /**
   * Tag stroke color
   */
  strokeColor?: string;
  /**
   * Tag background color
   */
  bgColor?: string;
  /**
   * Tag font
   */
  font: string;
  /**
   * Tag border radius
   */
  borderRadius: number;
  /**
   * Width of the tag pointer
   */
  pointerWidth: number;
}

type TagStyleOptions = Partial<TagStyle>;

interface CommitDotStyle {
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
  strokeWidth?: number;
  /**
   * Commit dot stroke color
   */
  strokeColor?: string;
  /**
   * Commit dot font
   */
  font: string;
}

type CommitDotStyleOptions = Partial<CommitDotStyle>;

interface CommitMessageStyle {
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
   * Commit message hash display policy
   */
  displayHash: boolean;
  /**
   * Commit message font
   */
  font: string;
}

type CommitMessageStyleOptions = Partial<CommitMessageStyle>;

interface CommitStyleBase {
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
  hasTooltipInCompactMode: boolean;
}

interface CommitStyle extends CommitStyleBase {
  /**
   * Commit message style
   */
  message: CommitMessageStyle;
  /**
   * Commit dot style
   */
  dot: CommitDotStyle;
}

interface CommitStyleOptions extends Partial<CommitStyleBase> {
  /**
   * Commit message style
   */
  message?: CommitMessageStyleOptions;
  /**
   * Commit dot style
   */
  dot?: CommitDotStyleOptions;
}

interface TemplateOptions {
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
  /**
   * Tag style
   */
  tag?: TagStyleOptions;
}

export const DEFAULT_FONT = "normal 12pt Calibri";

/**
 * Gitgraph template
 *
 * Set of design rules for the rendering.
 */
class Template {
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
  /**
   * Tag style
   */
  public tag: TagStyleOptions;

  constructor(options: TemplateOptions) {
    // Options
    options.branch = options.branch || {};
    options.branch.label = options.branch.label || {};
    options.arrow = options.arrow || {};
    options.commit = options.commit || {};
    options.commit.dot = options.commit.dot || {};
    options.commit.message = options.commit.message || {};

    // One color per column
    this.colors = options.colors || ["#000000"];

    // Branch style
    this.branch = {
      color: options.branch.color,
      lineWidth: options.branch.lineWidth || 2,
      mergeStyle: options.branch.mergeStyle || MergeStyle.Bezier,
      spacing: numberOptionOr(options.branch.spacing, 20),
      label: {
        display: booleanOptionOr(options.branch.label.display, true),
        color: options.branch.label.color || options.commit.color,
        strokeColor: options.branch.label.strokeColor || options.commit.color,
        bgColor: options.branch.label.bgColor || "white",
        font:
          options.branch.label.font ||
          options.commit.message.font ||
          DEFAULT_FONT,
        borderRadius: numberOptionOr(options.branch.label.borderRadius, 10),
      },
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
      spacing: numberOptionOr(options.commit.spacing, 25),
      hasTooltipInCompactMode: booleanOptionOr(
        options.commit.hasTooltipInCompactMode,
        true,
      ),
      dot: {
        color: options.commit.dot.color || options.commit.color,
        size: options.commit.dot.size || 3,
        strokeWidth: numberOptionOr(options.commit.dot.strokeWidth, 0),
        strokeColor: options.commit.dot.strokeColor,
        font:
          options.commit.dot.font ||
          options.commit.message.font ||
          "normal 10pt Calibri",
      },
      message: {
        display: booleanOptionOr(options.commit.message.display, true),
        displayAuthor: booleanOptionOr(
          options.commit.message.displayAuthor,
          true,
        ),
        displayHash: booleanOptionOr(options.commit.message.displayHash, true),
        color: options.commit.message.color || options.commit.color,
        font: options.commit.message.font || DEFAULT_FONT,
      },
    };

    // Tag style
    // This one is computed in the Tag instance. It needs Commit style
    // that is partially computed at runtime (for colors).
    this.tag = options.tag || {};
  }
}

/**
 * Black arrow template
 */
const blackArrowTemplate = new Template({
  colors: ["#6963FF", "#47E8D4", "#6BDB52", "#E84BA5", "#FFA657"],
  branch: {
    color: "#000000",
    lineWidth: 4,
    spacing: 50,
    mergeStyle: MergeStyle.Straight,
  },
  commit: {
    spacing: 60,
    dot: {
      size: 16,
      strokeColor: "#000000",
      strokeWidth: 4,
    },
    message: {
      color: "black",
    },
  },
  arrow: {
    size: 16,
    offset: -1.5,
  },
});

/**
 * Metro template
 */
const metroTemplate = new Template({
  colors: ["#979797", "#008fb5", "#f1c109"],
  branch: {
    lineWidth: 10,
    spacing: 50,
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

enum TemplateName {
  Metro = "metro",
  BlackArrow = "blackarrow",
}

/**
 * Extend an existing template with new options.
 *
 * @param selectedTemplate Template to extend
 * @param options Template options
 */
function templateExtend(
  selectedTemplate: TemplateName,
  options: TemplateOptions,
): Template {
  const template = getTemplate(selectedTemplate);

  if (!options.branch) options.branch = {};
  if (!options.commit) options.commit = {};

  // This is tedious, but it seems acceptable so we don't need lodash
  // as we want to keep bundlesize small.
  return {
    colors: options.colors || template.colors,
    arrow: {
      ...template.arrow,
      ...options.arrow,
    },
    branch: {
      ...template.branch,
      ...options.branch,
      label: {
        ...template.branch.label,
        ...options.branch.label,
      },
    },
    commit: {
      ...template.commit,
      ...options.commit,
      dot: {
        ...template.commit.dot,
        ...options.commit.dot,
      },
      message: {
        ...template.commit.message,
        ...options.commit.message,
      },
    },
    tag: {
      ...template.tag,
      ...options.tag,
    },
  };
}

/**
 * Resolve the template to use regarding given `template` value.
 *
 * @param template Selected template name, or instance.
 */
function getTemplate(template?: TemplateName | Template): Template {
  if (!template) return metroTemplate;

  if (typeof template === "string") {
    return {
      [TemplateName.BlackArrow]: blackArrowTemplate,
      [TemplateName.Metro]: metroTemplate,
    }[template];
  }

  return template as Template;
}
