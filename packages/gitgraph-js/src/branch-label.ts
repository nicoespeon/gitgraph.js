import { Branch, Commit } from "@gitgraph/core";
import { createG, createRect, createText } from "./svg-elements";

export { createBranchLabel, PADDING_X, PADDING_Y };

const PADDING_X = 10;
const PADDING_Y = 5;

function createBranchLabel(branch: Branch, commit: Commit): SVGElement {
  const rect = createRect({
    width: 0,
    height: 0,
    borderRadius: branch.style.label.borderRadius,
    stroke: branch.style.label.strokeColor || commit.style.color,
    fill: branch.style.label.bgColor,
  });
  const text = createText({
    content: branch.name,
    translate: {
      x: PADDING_X,
      y: 0,
    },
    font: branch.style.label.font,
    fill: branch.style.label.color || commit.style.color,
  });

  const branchLabel = createG({ children: [rect] });

  const observer = new MutationObserver(() => {
    const { height, width } = text.getBBox();

    const boxWidth = width + 2 * PADDING_X;
    const boxHeight = height + 2 * PADDING_Y;

    // Ideally, it would be great to refactor these behavior into SVG elements.
    rect.setAttribute("width", boxWidth.toString());
    rect.setAttribute("height", boxHeight.toString());
    text.setAttribute("y", (boxHeight / 2).toString());
  });

  observer.observe(branchLabel, {
    attributes: false,
    subtree: false,
    childList: true,
  });

  // Add text after observer is set up => react based on text size.
  // We might refactor it by including `onChildrenUpdate()` to `createG()`.
  branchLabel.appendChild(text);

  return branchLabel;
}
