import {
  GitgraphCore,
  Commit,
  RenderedData,
  MergeStyle,
  toSvgPath,
  Coordinate,
} from "@gitgraph/core";

export { createGitgraph };

const BranchLabelPaddingX = 10;
const BranchLabelPaddingY = 5;
const TooltipPadding = 10;

function createGitgraph(graphContainer: HTMLElement) {
  // Create an `svg` context in which we'll render the graph.
  const svg = createSvg();
  adaptSvgOnUpdate(svg);
  graphContainer.appendChild(svg);

  // React on gitgraph updates to re-render the graph.
  const gitgraph = new GitgraphCore();
  gitgraph.subscribe(render);

  // Return usable API for end-user.
  return gitgraph.getUserApi();

  function render(data: RenderedData<SVGElement>): void {
    const { commits, branchesPaths, commitMessagesX } = data;

    // Reset SVG with new content.
    svg.innerHTML = "";
    svg.appendChild(
      createG({
        // Translate graph left => left-most branch label is not cropped (horizontal)
        // Translate graph down => top-most commit tooltip is not cropped
        translate: { x: BranchLabelPaddingX, y: TooltipPadding },
        children: [
          renderBranchesPaths(gitgraph, branchesPaths),
          renderCommits(gitgraph, commits, commitMessagesX),
        ],
      }),
    );
  }
}

function adaptSvgOnUpdate(svg: SVGSVGElement): void {
  const observer = new MutationObserver(() => {
    const { height, width } = svg.getBBox();

    svg.setAttribute(
      "width",
      // Add `TooltipPadding` so we don't crop the tooltip text.
      // Add `BranchLabelPaddingX` so we don't cut branch label.
      (width + BranchLabelPaddingX + TooltipPadding).toString(),
    );
    svg.setAttribute(
      "height",
      // Add `TooltipPadding` so we don't crop tooltip text
      // Add `BranchLabelPaddingY` so we don't crop branch label.
      (height + BranchLabelPaddingY + TooltipPadding).toString(),
    );
  });

  observer.observe(svg, {
    attributes: false,
    subtree: false,
    childList: true,
  });
}

function renderBranchesPaths(
  gitgraph: GitgraphCore,
  branchesPaths: RenderedData<SVGElement>["branchesPaths"],
): SVGElement {
  const offset = gitgraph.template.commit.dot.size;
  const isBezier = gitgraph.template.branch.mergeStyle === MergeStyle.Bezier;

  const paths = Array.from(branchesPaths).map(([branch, coordinates]) => {
    const path = createPath();
    path.setAttribute(
      "d",
      toSvgPath(
        coordinates.map((coordinate) => coordinate.map(getMessageOffset)),
        isBezier,
        gitgraph.isVertical,
      ),
    );
    path.setAttribute("fill", "transparent");
    path.setAttribute("stroke", branch.computedColor || "");
    path.setAttribute("stroke-width", branch.style.lineWidth.toString());
    path.setAttribute("transform", `translate(${offset}, ${offset})`);

    return path;
  });

  return createG({ children: paths });
}

function renderCommits(
  gitgraph: GitgraphCore,
  commits: Commit[],
  commitMessagesX: number,
): SVGGElement {
  return createG({ children: commits.map(renderCommit) });

  function renderCommit(commit: Commit): SVGGElement {
    // TODO: mimic `renderCommit` from @gitgraph/react.
    const text = createText({
      content: commit.message,
      fill: commit.style.message.color || "",
      font: commit.style.message.font,
      onClick: commit.onMessageClick,
    });

    const message = commit.style.message.display
      ? createG({
          translate: { x: 0, y: commit.style.dot.size },
          children: [text],
        })
      : null;

    return createG({
      translate: getMessageOffset(commit),
      children: [
        renderDot(commit),
        createG({
          translate: { x: commitMessagesX - commit.x, y: 0 },
          children: [message, ...renderBranchLabels(gitgraph, commit)],
        }),
      ],
    });
  }
}

function renderBranchLabels(
  gitgraph: GitgraphCore,
  commit: Commit,
): Array<SVGElement | null> {
  // @gitgraph/core could compute branch labels into commits directly.
  // That will make it easier to retrieve them, just like tags.
  const branches = Array.from(gitgraph.branches.values());
  return branches.map((branch) => {
    if (!branch.style.label.display) return null;

    const commitHash = gitgraph.refs.getCommit(branch.name);
    if (commit.hash !== commitHash) return null;

    // For the moment, we don't handle multiple branch labels.
    // To do so, we'd need to reposition each of them appropriately.
    if (commit.branchToDisplay !== branch.name) return null;

    // TODO: compute dynamically
    const boxWidth = 78; // state.textWidth + 2 * BranchLabelPaddingX;
    const boxHeight = 31; // state.textHeight + 2 * BranchLabelPaddingY;

    const branchLabel = createG({
      children: [
        createRect({
          width: boxWidth,
          height: boxHeight,
          borderRadius: branch.style.label.borderRadius,
          stroke: branch.style.label.strokeColor || commit.style.color,
          fill: branch.style.label.bgColor,
        }),
        createText({
          content: branch.name,
          translate: {
            x: BranchLabelPaddingX,
            y: boxHeight / 2,
          },
          font: branch.style.label.font,
          fill: branch.style.label.color || commit.style.color,
        }),
      ],
    });

    if (gitgraph.isVertical) {
      return createG({ children: [branchLabel] });
    } else {
      const commitDotSize = commit.style.dot.size * 2;
      const horizontalMarginTop = 10;

      return createG({
        translate: { x: commit.x, y: commitDotSize + horizontalMarginTop },
        children: [branchLabel],
      });
    }
  });
}

function renderDot(commit: Commit): SVGElement {
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
  const circleClipPath = document.createElementNS(SVG_NAMESPACE, "clipPath");
  circleClipPath.setAttribute("id", clipPathId);
  circleClipPath.appendChild(createUse(circleId));

  const circleDefs = document.createElementNS(SVG_NAMESPACE, "defs");
  circleDefs.appendChild(circle);
  circleDefs.appendChild(circleClipPath);

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
        translate: { x: commit.style.dot.size, y: commit.style.dot.size },
      })
    : null;

  // TODO: missing event handlers on <g>
  return createG({ children: [circleDefs, useCirclePath, dotText] });
}

// TODO: maybe we should rename. It's confusing and used for commit dot too.
function getMessageOffset({ x, y }: Coordinate): Coordinate {
  // TODO: handle missing `commitYWithOffsets` concept
  return { x, y };
}

// === SVG utilities

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function createSvg(): SVGSVGElement {
  return document.createElementNS(SVG_NAMESPACE, "svg");
}

interface GOptions {
  translate?: {
    x: number;
    y: number;
  };
  children?: Array<SVGElement | null>;
}

function createG(options?: GOptions): SVGGElement {
  const g = document.createElementNS(SVG_NAMESPACE, "g");
  if (!options) return g;

  if (options.translate) {
    g.setAttribute(
      "transform",
      `translate(${options.translate.x}, ${options.translate.y})`,
    );
  }

  if (options.children) {
    options.children.forEach((child) => child && g.appendChild(child));
  }

  return g;
}

interface TextOptions {
  content?: string;
  fill?: string;
  font?: string;
  anchor?: "start" | "middle" | "end";
  translate?: {
    x: number;
    y: number;
  };
  onClick?: () => void;
}

function createText(options?: TextOptions): SVGTextElement {
  const text = document.createElementNS(SVG_NAMESPACE, "text");
  text.setAttribute("alignment-baseline", "central");
  text.setAttribute("dominant-baseline", "central");

  if (!options) return text;

  if (options.content) {
    text.textContent = options.content;
  }

  if (options.fill) {
    text.setAttribute("fill", options.fill);
  }

  if (options.font) {
    text.setAttribute("style", `font: ${options.font}`);
  }

  if (options.anchor) {
    text.setAttribute("text-anchor", options.anchor);
  }

  if (options.translate) {
    text.setAttribute("x", options.translate.x.toString());
    text.setAttribute("y", options.translate.y.toString());
  }

  if (options.onClick) {
    text.addEventListener("click", options.onClick);
  }

  return text;
}

interface CircleOptions {
  id?: string;
  radius?: number;
  fill?: string;
}

function createCircle(options?: CircleOptions): SVGCircleElement {
  const circle = document.createElementNS(SVG_NAMESPACE, "circle");

  if (!options) return circle;

  if (options.id) {
    circle.setAttribute("id", options.id);
  }

  if (options.radius) {
    circle.setAttribute("cx", options.radius.toString());
    circle.setAttribute("cy", options.radius.toString());
    circle.setAttribute("r", options.radius.toString());
  }

  if (options.fill) {
    circle.setAttribute("fill", options.fill);
  }

  return circle;
}

interface RectOptions {
  width: number;
  height: number;
  borderRadius?: number;
  fill?: string;
  stroke?: string;
}

function createRect(options: RectOptions): SVGRectElement {
  const rect = document.createElementNS(SVG_NAMESPACE, "rect");
  rect.setAttribute("width", options.width.toString());
  rect.setAttribute("height", options.height.toString());

  if (options.borderRadius) {
    rect.setAttribute("rx", options.borderRadius.toString());
  }

  if (options.fill) {
    rect.setAttribute("fill", options.fill || "transparent");
  }

  if (options.stroke) {
    rect.setAttribute("stroke", options.stroke);
  }

  return rect;
}

function createPath(): SVGPathElement {
  return document.createElementNS(SVG_NAMESPACE, "path");
}

function createUse(href: string): SVGUseElement {
  const use = document.createElementNS(SVG_NAMESPACE, "use");
  use.setAttribute("href", `#${href}`);
  // xlink:href is deprecated in SVG2, but we keep it for retro-compatibility
  // => https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use#Browser_compatibility
  use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${href}`);

  return use;
}
