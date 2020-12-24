import {
  arrowSvgPath,
  BranchUserApi,
  Commit,
  Coordinate,
  GitgraphBranchOptions,
  GitgraphCommitOptions,
  GitgraphCore,
  GitgraphMergeOptions,
  GitgraphOptions,
  GitgraphTagOptions,
  MergeStyle,
  Mode,
  Orientation,
  RenderedData,
  templateExtend,
  TemplateName,
  toSvgPath,
} from "@gitgraph/core";

import {
  createCircle,
  createClipPath,
  createDefs,
  createForeignObject,
  createG,
  createPath,
  createSvg,
  createText,
  createUse,
} from "./svg-elements";
import {createBranchLabel, PADDING_X as BRANCH_LABEL_PADDING_X, PADDING_Y as BRANCH_LABEL_PADDING_Y,} from "./branch-label";
import {createTag, PADDING_X as TAG_PADDING_X} from "./tag";
import {createTooltip, PADDING as TOOLTIP_PADDING} from "./tooltip";

type CommitOptions = GitgraphCommitOptions<SVGElement>;
type BranchOptions = GitgraphBranchOptions<SVGElement>;
type TagOptions = GitgraphTagOptions<SVGElement>;
type MergeOptions = GitgraphMergeOptions<SVGElement>;
type Branch = BranchUserApi<SVGElement>;

export {
  createGitgraph,
  CommitOptions,
  Branch,
  BranchOptions,
  TagOptions,
  MergeOptions,
  Mode,
  Orientation,
  TemplateName,
  templateExtend,
  MergeStyle,
  Renderer,
  Commit,
};

interface CommitYWithOffsets {
  [key: number]: number;
}

class Renderer {
  public gitgraph: GitgraphCore;
  protected commits: Commit[];

  protected commitYWithOffsets: CommitYWithOffsets;
  protected $tooltip: SVGElement | null;

  protected svg: SVGSVGElement;
  protected svgChild?: SVGGElement;
  protected commitsElements: {
    [commitHash: string]: {
      branchLabel: SVGGElement | null;
      tags: SVGGElement[];
      message: SVGGElement | null;
    };
  } = {};
  // Store a map to replace commits y with the correct value,
  // including the message offset. Allows custom, flexible message height.
  // E.g. {20: 30} means for commit: y=20 -> y=30
  // Offset should be computed when graph is rendered (componentDidUpdate).
  protected shouldRecomputeOffsets: boolean;
  protected lastData?: RenderedData<SVGElement>;
  protected $commits?: SVGElement;
  protected commitMessagesX: number;


  constructor(graphContainer: HTMLElement, gitgraph?: GitgraphCore) {
    this.commits = [];
    this.gitgraph = gitgraph || new GitgraphCore();
    // Store a map to replace commits y with the correct value,
    // including the message offset. Allows custom, flexible message height.
    // E.g. {20: 30} means for commit: y=20 -> y=30
    // Offset should be computed when graph is rendered (componentDidUpdate).
    this.commitYWithOffsets = {};
    this.$tooltip = null;
    this.commitsElements = {};
    this.shouldRecomputeOffsets = false;
    this.commitMessagesX = 0;

    // Create an `svg` context in which we'll render the graph.
    this.svg = createSvg();
    this.adaptSvgOnUpdate();
    graphContainer.appendChild(this.svg);
  }

  public rerender(): void {
    if (this.lastData) {
      this.render(this.lastData, false);
    }
  }

  public render(data: RenderedData<SVGElement>, shouldRecomputeOffsets: boolean): void {
    this.shouldRecomputeOffsets = shouldRecomputeOffsets;
    // Reset before new rendering to flush previous state.
    this.commitsElements = {};

    const {commits} = data;
    this.commitMessagesX = data.commitMessagesX;

    // Store data so we can re-render after offsets are computed.
    this.lastData = data;

    // Store $commits so we can compute offsets from actual height.
    this.$commits = this.renderCommits(commits);

    // Reset SVG with new content.
    const svgChild = createG({
      // Translate graph left => left-most branch label is not cropped (horizontal)
      // Translate graph down => top-most commit tooltip is not cropped
      translate: {x: BRANCH_LABEL_PADDING_X, y: TOOLTIP_PADDING},
      children: this.getSvgChildren(),
    })

    if (this.svg.replaceChild && this.svgChild) {
      this.svg.replaceChild(svgChild, this.svgChild);
    }
    else {
      this.svg.innerHTML = "";
      this.svg.appendChild(svgChild);
    }
    this.svgChild = svgChild;
  }

  protected getSvgChildren(): Array<SVGElement> {
    return [this.renderBranchesPaths(this.lastData!.branchesPaths), this.$commits!];
  }

  protected adaptSvgOnUpdate(): void {
    const observer = new MutationObserver(() => {
      if (this.shouldRecomputeOffsets) {
        this.shouldRecomputeOffsets = false;
        this.computeOffsets();
        this.rerender();
      } else {
        this.positionCommitsElements();
        this.adaptGraphDimensions();
      }
    });

    observer.observe(this.svg, {
      attributes: false,
      // Listen to subtree changes to react when we append the tooltip.
      subtree: true,
      childList: true,
    });
  }

  protected computeOffsets(): void {
    const commits: Element[] = Array.from(this.$commits!.children);
    let totalOffsetY = 0;

    // In VerticalReverse orientation, commits are in the same order in the DOM.
    const orientedCommits =
        this.gitgraph.orientation === Orientation.VerticalReverse
            ? commits
            : commits.reverse();

    this.commitYWithOffsets = orientedCommits.reduce<CommitYWithOffsets>(
        (newOffsets, commit) => {
          const commitY = parseInt(
              commit.getAttribute("transform")!.split(",")[1].slice(0, -1),
              10,
          );

          const firstForeignObject = commit.getElementsByTagName(
              "foreignObject",
          )[0];
          const customHtmlMessage =
              firstForeignObject && firstForeignObject.firstElementChild;

          newOffsets[commitY] = commitY + totalOffsetY;

          // Increment total offset after setting the offset
          // => offset next commits accordingly.
          totalOffsetY += getMessageHeight(customHtmlMessage);

          return newOffsets;
        },
        {},
    );
  }

  protected positionCommitsElements(): void {
    if (this.gitgraph.isHorizontal) {
      // Elements don't appear on horizontal mode, yet.
      return;
    }

    const padding = 10;

    // Ensure commits elements (branch labels, message…) are well positionned.
    // It can't be done at render time since elements size is dynamic.
    Object.keys(this.commitsElements).forEach((commitHash) => {
      const {branchLabel, tags, message} = this.commitsElements[commitHash];

      // We'll store X position progressively and translate elements.
      let x = this.commitMessagesX;

      if (branchLabel) {
        this.moveElement(branchLabel, x);

        // BBox width misses box padding
        // => they are set later, on branch label update.
        // We would need to make branch label update happen before to solve it.
        const branchLabelWidth =
            branchLabel.getBBox().width + 2 * BRANCH_LABEL_PADDING_X;
        x += branchLabelWidth + padding;
      }

      tags.forEach((tag) => {
        this.moveElement(tag, x);

        // BBox width misses box padding and offset
        // => they are set later, on tag update.
        // We would need to make tag update happen before to solve it.
        const offset = parseFloat(tag.getAttribute("data-offset") || "0");
        const tagWidth = tag.getBBox().width + 2 * TAG_PADDING_X + offset;
        x += tagWidth + padding;
      });

      if (message) {
        this.moveElement(message, x);
      }
    });
  }

  protected adaptGraphDimensions(): void {
    const {height, width} = this.svg.getBBox();

    // FIXME: In horizontal mode, we mimic @gitgraph/react behavior
    // => it gets re-rendered after offsets are computed
    // => it applies paddings twice!
    //
    // It works… by chance. Technically, we should compute what would
    // *actually* go beyond the computed limits of the graph.
    const horizontalCustomOffset = 50;
    const verticalCustomOffset = 20;

    const widthOffset = this.gitgraph.isHorizontal
        ? horizontalCustomOffset
        : // Add `TOOLTIP_PADDING` so we don't crop the tooltip text.
          // Add `BRANCH_LABEL_PADDING_X` so we don't cut branch label.
        BRANCH_LABEL_PADDING_X + TOOLTIP_PADDING;

    const heightOffset = this.gitgraph.isHorizontal
        ? horizontalCustomOffset
        : // Add `TOOLTIP_PADDING` so we don't crop tooltip text
          // Add `BRANCH_LABEL_PADDING_Y` so we don't crop branch label.
        BRANCH_LABEL_PADDING_Y + TOOLTIP_PADDING + verticalCustomOffset;

    this.svg.setAttribute("width", (width + widthOffset).toString());
    this.svg.setAttribute("height", (height + heightOffset).toString());
  }

  protected moveElement(target: Element, x: number): void {
    const transform = target.getAttribute("transform") || "translate(0, 0)";
    target.setAttribute(
        "transform",
        transform.replace(/translate\(([\d\.]+),/, `translate(${x},`),
    );
  }

  protected moveElementByXY(target: Element, x:number, y: number): void {
    const transform = target.getAttribute("transform") || "translate(0, 0)";
    const matches = transform.match(/translate\((?<x>[\d.]+),\s*(?<y>[\d.]+)/);
    let existingXY;
    if (matches) {
      existingXY = matches.groups;
    }
    if (!existingXY) {
      existingXY = {x:0, y:0}
    }
    target.setAttribute(
        "transform",
         // `+x` trick to convert string to integer
         `translate(${(+existingXY.x)+x}, ${(+existingXY.y)+y})`
    );
  }

  protected renderBranchesPaths(
      branchesPaths: RenderedData<SVGElement>["branchesPaths"],
  ): SVGElement {
    const offset = this.gitgraph.template.commit.dot.size;
    const isBezier = this.gitgraph.template.branch.mergeStyle === MergeStyle.Bezier;

    const paths = Array.from(branchesPaths).map(([branch, coordinates]) => {
      return createPath({
        d: toSvgPath(
            coordinates.map((coordinate) => coordinate.map(this.getWithCommitOffset.bind(this))),
            isBezier,
            this.gitgraph.isVertical,
        ),
        fill: "none",
        stroke: branch.computedColor || "",
        strokeWidth: branch.style.lineWidth,
        translate: {
          x: offset,
          y: offset,
        },
      });
    });

    return createG({children: paths});
  }

  protected renderCommits(commits: Commit[]): SVGGElement {
    this.commits = commits;
    return createG({children: commits.map(this.renderCommit.bind(this))});
  }

  protected renderCommit(commit: Commit): SVGGElement {
    const {x, y} = this.getWithCommitOffset(commit);
    return this.createCommitGroup(commit, {x, y});
  }

  protected getWithCommitOffset({x, y}: Coordinate): Coordinate {
    return {x, y: this.commitYWithOffsets[y] || y};
  }

  protected createCommitGroup(commit: Commit, {x, y}: Coordinate): SVGGElement {
    return createG({
      translate: {x, y},
      children: this.getCommitGroupChildren(commit, {x, y}),
    })
  }

  protected getCommitGroupChildren(commit: Commit, {x, y}: Coordinate): Array<SVGElement | null> {
    return [
      this.renderDot(commit),
      ...this.renderArrows(commit),
      this.renderCommitDesc(commit, {x, y}),
    ]
  }

  protected appendTooltipToGraph(commit: Commit): void {
    if (!this.svg.firstChild) return;
    if (this.gitgraph.isVertical && this.gitgraph.mode !== Mode.Compact) return;
    if (this.gitgraph.isVertical && !commit.style.hasTooltipInCompactMode) return;

    const tooltip = commit.renderTooltip
        ? commit.renderTooltip(commit)
        : createTooltip(commit);

    this.$tooltip = createG({
      translate: this.getWithCommitOffset(commit),
      children: [tooltip],
    });

    this.svg.firstChild.appendChild(this.$tooltip);
  }

  protected renderDot(commit: Commit): SVGElement {
    if (commit.renderDot) {
      return commit.renderDot(commit);
    }

    /*
    In order to handle strokes, we need to do some complex stuff here… 😅

    Problem: strokes are drawn inside & outside the circle.
    But we want the stroke to be drawn inside only!

    The outside overlaps with other elements, as we expect the dot to have a fixed size. So we want to crop the outside part.

    Solution:
    1. Create the circle in a <defs>
    2. Define a clip path that references the circle
    3. Use the clip path, adding the stroke.
    4. Double stroke width as half of it will be clipped (the outside part).

    Ref.: https://stackoverflow.com/a/32162431/3911841

    P.S. there is a proposal for a stroke-alignment property,
    but it's still a W3C Draft ¯\_(ツ)_/¯
    https://svgwg.org/specs/strokes/#SpecifyingStrokeAlignment
  */
    const circleId = commit.hash;
    const circle = createCircle({
      id: circleId,
      radius: commit.style.dot.size,
      fill: commit.style.dot.color || "",
    });

    const clipPathId = `clip-${commit.hash}`;
    const circleClipPath = createClipPath();
    circleClipPath.setAttribute("id", clipPathId);
    circleClipPath.appendChild(createUse(circleId));

    const useCirclePath = createUse(circleId);
    useCirclePath.setAttribute("clip-path", `url(#${clipPathId})`);
    useCirclePath.setAttribute("stroke", commit.style.dot.strokeColor || "");
    const strokeWidth = commit.style.dot.strokeWidth
        ? commit.style.dot.strokeWidth * 2
        : 0;
    useCirclePath.setAttribute("stroke-width", strokeWidth.toString());

    const dotText = commit.dotText
        ? createText({
          content: commit.dotText,
          font: commit.style.dot.font,
          anchor: "middle",
          translate: {x: commit.style.dot.size, y: commit.style.dot.size},
        })
        : null;

    return createG({
      onClick: commit.onClick,
      onMouseOver: () => {
        this.appendTooltipToGraph(commit);
        commit.onMouseOver();
      },
      onMouseOut: () => {
        if (this.$tooltip) this.$tooltip.remove();
        commit.onMouseOut();
      },
      children: [createDefs([circle, circleClipPath]), useCirclePath, dotText],
    });
  }

  private parentCommitsCache: Record<string, Array<Commit|null>> = {};
  protected getParentCommits(commit: Commit): Array<Commit|null> {
    if (this.parentCommitsCache[commit.hash]) {
      return this.parentCommitsCache[commit.hash];
    }
    const parentCommits = commit.parents.map((parentHash) => {
      const parent = this.commits.find(({hash}) => hash === parentHash);
      return parent || null;
    })
    this.parentCommitsCache[commit.hash] = parentCommits;
    return parentCommits;
  }
  protected renderArrows(commit: Commit): Array<SVGElement | null> {
    if (!this.gitgraph.template.arrow.size) {
      return [null];
    }

    const commitRadius = commit.style.dot.size;

    return this.getParentCommits(commit).map((parent) => {
      if (!parent) return null;

      // Starting point, relative to commit
      const origin = this.gitgraph.reverseArrow
          ? {
            x: commitRadius + (parent.x - commit.x),
            y: commitRadius + (parent.y - commit.y),
          }
          : {x: commitRadius, y: commitRadius};

      const path = createPath({
        d: arrowSvgPath(this.gitgraph, parent, commit),
        fill: this.gitgraph.template.arrow.color || "",
      });

      return createG({translate: origin, children: [path]});
    });
  }

  protected renderCommitDesc(commit: Commit, {x, y}: Coordinate): SVGGElement {
    return createG({
      translate: {x: -x, y: 0},
      children: this.getCommitDescChildren(commit)
    })
  }

  protected getCommitDescChildren(commit: Commit): Array<SVGElement | null> {
    return [
      this.renderMessage(commit),
      ...this.renderBranchLabels(commit),
      ...this.renderTags(commit),
    ]
  }

  protected renderMessage(commit: Commit): SVGElement | null {
    if (!commit.style.message.display) {
      return null;
    }

    let message;

    if (commit.renderMessage) {
      message = createG({children: []});

      // Add message after observer is set up => react based on body height.
      // We might refactor it by including `onChildrenUpdate()` to `createG()`.
      this.adaptMessageBodyHeight(message);
      message.appendChild(commit.renderMessage(commit));

      this.setMessageRef(commit, message);

      return message;
    }

    const text = createText({
      content: commit.message,
      fill: commit.style.message.color || "",
      font: commit.style.message.font,
      onClick: commit.onMessageClick,
    });

    message = createG({
      translate: {x: 0, y: commit.style.dot.size},
      children: [text],
    });

    if (commit.body) {
      const body = createForeignObject({
        width: 600,
        translate: {x: 10, y: 0},
        content: commit.body,
      });

      // Add message after observer is set up => react based on body height.
      // We might refactor it by including `onChildrenUpdate()` to `createG()`.
      this.adaptMessageBodyHeight(message);
      message.appendChild(body);
    }

    this.setMessageRef(commit, message);

    return message;
  }

  protected renderBranchLabels(commit: Commit): Array<SVGElement | null> {
    // @gitgraph/core could compute branch labels into commits directly.
    // That will make it easier to retrieve them, just like tags.
    const branches = Array.from(this.gitgraph.branches.values());
    return branches.map((branch) => {
      if (!branch.style.label.display) return null;

      if (!this.gitgraph.branchLabelOnEveryCommit) {
        const commitHash = this.gitgraph.refs.getCommit(branch.name);
        if (commit.hash !== commitHash) return null;
      }

      // For the moment, we don't handle multiple branch labels.
      // To do so, we'd need to reposition each of them appropriately.
      if (commit.branchToDisplay !== branch.name) return null;

      const branchLabel = branch.renderLabel
          ? branch.renderLabel(branch)
          : createBranchLabel(branch, commit);

      let branchLabelContainer;
      if (this.gitgraph.isVertical) {
        branchLabelContainer = createG({
          children: [branchLabel],
        });
      } else {
        const commitDotSize = commit.style.dot.size * 2;
        const horizontalMarginTop = 10;

        branchLabelContainer = createG({
          translate: {x: commit.x, y: commitDotSize + horizontalMarginTop},
          children: [branchLabel],
        });
      }

      this.setBranchLabelRef(commit, branchLabelContainer);

      return branchLabelContainer;
    });
  }

  protected renderTags(commit: Commit): SVGGElement[] {
    if (!commit.tags) return [];
    if (this.gitgraph.isHorizontal) return [];

    return commit.tags.map((tag) => {
      const tagElement = tag.render
          ? tag.render(tag.name, tag.style)
          : createTag(tag);
      const tagContainer = createG({
        translate: {x: 0, y: commit.style.dot.size},
        children: [tagElement],
      });
      // `data-offset` is used to position tag element in `positionCommitsElements`.
      // => because when it's executed, tag offsets are not resolved yet
      tagContainer.setAttribute(
          "data-offset",
          tag.style.pointerWidth.toString(),
      );

      this.setTagRef(commit, tagContainer);

      return tagContainer;
    });
  }


  protected adaptMessageBodyHeight(message: SVGElement): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(({target}) => setChildrenForeignObjectHeight(target));
    });

    observer.observe(message, {
      attributes: false,
      subtree: false,
      childList: true,
    });

    function setChildrenForeignObjectHeight(node: Node): void {
      if (node.nodeName === "foreignObject") {
        // We have to access the first child's parentElement to retrieve
        // the Element instead of the Node => we can compute dimensions.
        const foreignObject = node.firstChild && node.firstChild.parentElement;
        if (!foreignObject) return;

        // Force the height of the foreignObject (browser issue)
        foreignObject.setAttribute(
            "height",
            getMessageHeight(foreignObject.firstElementChild).toString(),
        );
      }

      node.childNodes.forEach(setChildrenForeignObjectHeight);
    }
  }

  protected setBranchLabelRef(commit: Commit, branchLabels: SVGGElement): void {
    if (!this.commitsElements[commit.hashAbbrev]) {
      this.initCommitElements(commit);
    }

    this.commitsElements[commit.hashAbbrev].branchLabel = branchLabels;
  }

  protected setMessageRef(commit: Commit, message: SVGGElement | null): void {
    if (!this.commitsElements[commit.hashAbbrev]) {
      this.initCommitElements(commit);
    }

    this.commitsElements[commit.hashAbbrev].message = message;
  }

  protected setTagRef(commit: Commit, tag: SVGGElement): void {
    if (!this.commitsElements[commit.hashAbbrev]) {
      this.initCommitElements(commit);
    }

    this.commitsElements[commit.hashAbbrev].tags.push(tag);
  }

  protected initCommitElements(commit: Commit): void {
    this.commitsElements[commit.hashAbbrev] = {
      branchLabel: null,
      tags: [],
      message: null,
    };
  }
}

function createGitgraph(
  graphContainer: HTMLElement,
  options?: GitgraphOptions,
  createRenderer?: (graphContainer: HTMLElement, gitgraph: GitgraphCore) => Renderer,
) {

  const gitgraph = new GitgraphCore(options);
  let renderer: Renderer;
  if (createRenderer) {
    renderer = createRenderer(graphContainer, gitgraph);
  }
  else {
    renderer = new Renderer(graphContainer, gitgraph);
  }

  // React on gitgraph updates to re-render the graph.
  gitgraph.subscribe((data) => {
    renderer!.render(data, true);
  });

  // Return usable API for end-user.
  return gitgraph.getUserApi();
}

function getMessageHeight(message: Element | null): number {
  let messageHeight = 0;

  if (message) {
    const height = message.getBoundingClientRect().height;
    const marginTopInPx = window.getComputedStyle(message).marginTop || "0px";
    const marginTop = parseInt(marginTopInPx.replace("px", ""), 10);

    messageHeight = height + marginTop;
  }

  return messageHeight;
}
