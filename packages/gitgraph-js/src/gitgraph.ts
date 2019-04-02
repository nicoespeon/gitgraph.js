import {
  GitgraphCore,
  GitgraphOptions,
  Commit,
  RenderedData,
  MergeStyle,
  toSvgPath,
  Coordinate,
  Mode,
  Branch,
} from "@gitgraph/core";

import {
  createSvg,
  createG,
  createText,
  createCircle,
  createUse,
  createPath,
  createClipPath,
  createDefs,
} from "./svg-elements";
import {
  createBranchLabel,
  PADDING_X as BRANCH_LABEL_PADDING_X,
  PADDING_Y as BRANCH_LABEL_PADDING_Y,
} from "./branch-label";
import { createTag, PADDING_X as TAG_PADDING_X } from "./tag";

export { createGitgraph, Mode, Branch };

const TooltipPadding = 10;

function createGitgraph(
  graphContainer: HTMLElement,
  options?: GitgraphOptions,
) {
  let commitsElements: {
    [commitHash: string]: {
      branchLabel: SVGGElement | null;
      tags: SVGGElement[];
      message: SVGGElement | null;
    };
  } = {};
  let commitMessagesX = 0;

  // Create an `svg` context in which we'll render the graph.
  const svg = createSvg();
  adaptSvgOnUpdate();
  graphContainer.appendChild(svg);

  // React on gitgraph updates to re-render the graph.
  const gitgraph = new GitgraphCore(options);
  gitgraph.subscribe(render);

  // Return usable API for end-user.
  return gitgraph.getUserApi();

  function render(data: RenderedData<SVGElement>): void {
    // Reset before new rendering to flush previous state.
    commitsElements = {};

    const { commits, branchesPaths } = data;
    commitMessagesX = data.commitMessagesX;

    // Reset SVG with new content.
    svg.innerHTML = "";
    svg.appendChild(
      createG({
        // Translate graph left => left-most branch label is not cropped (horizontal)
        // Translate graph down => top-most commit tooltip is not cropped
        translate: { x: BRANCH_LABEL_PADDING_X, y: TooltipPadding },
        children: [renderBranchesPaths(branchesPaths), renderCommits(commits)],
      }),
    );
  }

  function adaptSvgOnUpdate(): void {
    const observer = new MutationObserver(() => {
      positionCommitsElements();
      adaptGraphDimensions();
    });

    observer.observe(svg, {
      attributes: false,
      subtree: false,
      childList: true,
    });

    function positionCommitsElements(): void {
      if (gitgraph.isHorizontal) {
        // Elements don't appear on horizontal mode, yet.
        return;
      }

      const padding = 10;

      // Ensure commits elements (branch labels, message…) are well positionned.
      // It can't be done at render time since elements size is dynamic.
      Object.keys(commitsElements).forEach((commitHash) => {
        const { branchLabel, tags, message } = commitsElements[commitHash];

        // We'll store X position progressively and translate elements.
        let x = commitMessagesX;

        if (branchLabel) {
          moveElement(branchLabel, x);

          // BBox width misses box padding
          // => they are set later, on branch label update.
          // We would need to make branch label update happen before to solve it.
          const branchLabelWidth =
            branchLabel.getBBox().width + 2 * BRANCH_LABEL_PADDING_X;
          x += branchLabelWidth + padding;
        }

        tags.forEach((tag) => {
          moveElement(tag, x);

          // BBox width misses box padding and offset
          // => they are set later, on branch label update.
          // We would need to make branch label update happen before to solve it.
          const offset = parseFloat(tag.getAttribute("data-offset") || "0");
          const tagWidth = tag.getBBox().width + 2 * TAG_PADDING_X + offset;
          x += tagWidth + padding;
        });

        if (message) {
          moveElement(message, x);
        }
      });
    }

    function adaptGraphDimensions(): void {
      const { height, width } = svg.getBBox();
      svg.setAttribute(
        "width",
        // Add `TooltipPadding` so we don't crop the tooltip text.
        // Add `BRANCH_LABEL_PADDING_X` so we don't cut branch label.
        (width + BRANCH_LABEL_PADDING_X + TooltipPadding).toString(),
      );
      svg.setAttribute(
        "height",
        // Add `TooltipPadding` so we don't crop tooltip text
        // Add `BRANCH_LABEL_PADDING_Y` so we don't crop branch label.
        (height + BRANCH_LABEL_PADDING_Y + TooltipPadding).toString(),
      );
    }
  }

  function moveElement(target: Element, x: number): void {
    const transform = target.getAttribute("transform") || "translate(0, 0)";
    target.setAttribute(
      "transform",
      transform.replace(/translate\(([\d\.]+),/, `translate(${x},`),
    );
  }

  function renderBranchesPaths(
    branchesPaths: RenderedData<SVGElement>["branchesPaths"],
  ): SVGElement {
    const offset = gitgraph.template.commit.dot.size;
    const isBezier = gitgraph.template.branch.mergeStyle === MergeStyle.Bezier;

    const paths = Array.from(branchesPaths).map(([branch, coordinates]) => {
      return createPath({
        d: toSvgPath(
          coordinates.map((coordinate) => coordinate.map(getMessageOffset)),
          isBezier,
          gitgraph.isVertical,
        ),
        fill: "transparent",
        stroke: branch.computedColor || "",
        strokeWidth: branch.style.lineWidth,
        translate: {
          x: offset,
          y: offset,
        },
      });
    });

    return createG({ children: paths });
  }

  function renderCommits(commits: Commit[]): SVGGElement {
    return createG({ children: commits.map(renderCommit) });

    function renderCommit(commit: Commit): SVGGElement {
      const { x, y } = getMessageOffset(commit);

      // TODO: implement with tooltips
      //   const shouldRenderTooltip =
      //   this.state.currentCommitOver === commit &&
      //   (this.gitgraph.isHorizontal ||
      //     (this.gitgraph.mode === Mode.Compact &&
      //       commit.style.hasTooltipInCompactMode));

      // if (shouldRenderTooltip) {
      //   this.$tooltip = (
      //     <g key={commit.hashAbbrev} transform={`translate(${x}, ${y})`}>
      //       {this.renderTooltip(commit)}
      //     </g>
      //   );
      // }

      return createG({
        translate: { x, y },
        children: [
          renderDot(commit),
          // TODO: render arrows
          createG({
            translate: { x: -x, y: 0 },
            children: [
              renderMessage(commit),
              ...renderBranchLabels(commit),
              ...renderTags(commit),
            ],
          }),
        ],
      });
    }
  }

  function renderMessage(commit: Commit): SVGElement | null {
    if (!commit.style.message.display) {
      return null;
    }

    // TODO: handle custom renderMessage

    const text = createText({
      content: commit.message,
      fill: commit.style.message.color || "",
      font: commit.style.message.font,
      onClick: commit.onMessageClick,
    });

    const message = createG({
      translate: { x: 0, y: commit.style.dot.size },
      children: [text],
    });

    setMessageRef(commit, message);

    return message;
  }

  function renderBranchLabels(commit: Commit): Array<SVGElement | null> {
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

      let branchLabel;
      if (gitgraph.isVertical) {
        branchLabel = createG({
          children: [createBranchLabel(branch, commit)],
        });
      } else {
        const commitDotSize = commit.style.dot.size * 2;
        const horizontalMarginTop = 10;

        branchLabel = createG({
          translate: { x: commit.x, y: commitDotSize + horizontalMarginTop },
          children: [createBranchLabel(branch, commit)],
        });
      }

      setBranchLabelRef(commit, branchLabel);

      return branchLabel;
    });
  }

  function renderTags(commit: Commit): SVGGElement[] {
    if (!commit.tags) return [];

    return commit.tags.map((tag) => {
      const tagElement = createTag(tag);

      setTagRef(commit, tagElement);

      return createG({
        translate: { x: 0, y: commit.style.dot.size },
        children: [tagElement],
      });
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
          translate: { x: commit.style.dot.size, y: commit.style.dot.size },
        })
      : null;

    // TODO: missing event handlers on <g>
    return createG({
      children: [createDefs([circle, circleClipPath]), useCirclePath, dotText],
    });
  }

  // TODO: maybe we should rename. It's confusing and used for commit dot too.
  function getMessageOffset({ x, y }: Coordinate): Coordinate {
    // TODO: handle missing `commitYWithOffsets` concept
    return { x, y };
  }

  function setBranchLabelRef(commit: Commit, branchLabels: SVGGElement): void {
    if (!commitsElements[commit.hashAbbrev]) {
      initCommitElements(commit);
    }

    commitsElements[commit.hashAbbrev].branchLabel = branchLabels;
  }

  function setMessageRef(commit: Commit, message: SVGGElement | null): void {
    if (!commitsElements[commit.hashAbbrev]) {
      initCommitElements(commit);
    }

    commitsElements[commit.hashAbbrev].message = message;
  }

  function setTagRef(commit: Commit, tag: SVGGElement): void {
    if (!commitsElements[commit.hashAbbrev]) {
      initCommitElements(commit);
    }

    commitsElements[commit.hashAbbrev].tags.push(tag);
  }

  function initCommitElements(commit: Commit): void {
    commitsElements[commit.hashAbbrev] = {
      branchLabel: null,
      tags: [],
      message: null,
    };
  }
}
