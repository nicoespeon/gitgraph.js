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
    const { commits, branchesPaths } = data;

    // Reset SVG with new content.
    svg.innerHTML = "";
    svg.appendChild(
      createG({
        // Translate graph left => left-most branch label is not cropped (horizontal)
        // Translate graph down => top-most commit tooltip is not cropped
        translate: { x: BranchLabelPaddingX, y: TooltipPadding },
        children: [
          renderBranchesPaths(gitgraph, branchesPaths),
          renderCommits(commits),
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

function renderCommits(commits: Commit[]): SVGGElement {
  return createG({ children: commits.map(renderCommit) });
}

function renderCommit(commit: Commit): SVGGElement {
  // TODO: mimic `renderCommit` from @gitgraph/react.
  const text = createText();
  text.setAttribute("alignment-baseline", "central");
  text.setAttribute("fill", commit.style.message.color || "");
  text.setAttribute("style", `font: ${commit.style.message.font}`);
  text.addEventListener("click", commit.onMessageClick);
  text.textContent = commit.subject;

  const message = createG({
    translate: { x: 0, y: commit.style.dot.size },
    children: [text],
  });

  return createG({
    translate: getMessageOffset(commit),
    children: [message],
  });
}

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
  children?: SVGElement[];
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
    options.children.forEach((child) => g.appendChild(child));
  }

  return g;
}

function createText(): SVGTextElement {
  return document.createElementNS(SVG_NAMESPACE, "text");
}

function createPath(): SVGPathElement {
  return document.createElementNS(SVG_NAMESPACE, "path");
}
