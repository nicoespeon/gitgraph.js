import { Branch, Commit } from "@gitgraph/core";
import { createG, createRect, createText } from "./svg-elements";

export { renderBranchLabel, PADDING_X, PADDING_Y };

const PADDING_X = 10;
const PADDING_Y = 5;

function renderBranchLabel(branch: Branch, commit: Commit): SVGElement {
  // TODO: compute dynamically
  const boxWidth = 78; // state.textWidth + 2 * PADDING_X;
  const boxHeight = 31; // state.textHeight + 2 * PADDING_Y;

  return createG({
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
          x: PADDING_X,
          y: boxHeight / 2,
        },
        font: branch.style.label.font,
        fill: branch.style.label.color || commit.style.color,
      }),
    ],
  });
}
