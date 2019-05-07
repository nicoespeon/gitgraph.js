import { createG, createText, createPath } from "./svg-elements";
import { Tag } from "@gitgraph/core";

export { createTag, PADDING_X };

const PADDING_X = 10;
const PADDING_Y = 5;

function createTag(tag: Tag<SVGElement>): SVGGElement {
  const path = createPath({
    d: "",
    fill: tag.style.bgColor,
    stroke: tag.style.strokeColor,
  });
  const text = createText({
    content: tag.name,
    fill: tag.style.color,
    font: tag.style.font,
    translate: { x: 0, y: 0 },
  });

  const result = createG({ children: [path] });
  const offset = tag.style.pointerWidth;

  const observer = new MutationObserver(() => {
    const { height, width } = text.getBBox();
    if (height === 0 || width === 0) return;

    const radius = tag.style.borderRadius;
    const boxWidth = offset + width + 2 * PADDING_X;
    const boxHeight = height + 2 * PADDING_Y;

    const pathD = [
      "M 0,0",
      `L ${offset},${boxHeight / 2}`,
      `V ${boxHeight / 2}`,
      `Q ${offset},${boxHeight / 2} ${offset + radius},${boxHeight / 2}`,
      `H ${boxWidth - radius}`,
      `Q ${boxWidth},${boxHeight / 2} ${boxWidth},${boxHeight / 2 - radius}`,
      `V -${boxHeight / 2 - radius}`,
      `Q ${boxWidth},-${boxHeight / 2} ${boxWidth - radius},-${boxHeight / 2}`,
      `H ${offset + radius}`,
      `Q ${offset},-${boxHeight / 2} ${offset},-${boxHeight / 2}`,
      `V -${boxHeight / 2}`,
      "z",
    ].join(" ");

    // Ideally, it would be great to refactor these behavior into SVG elements.
    path.setAttribute("d", pathD.toString());
    text.setAttribute("x", (offset + PADDING_X).toString());
  });

  observer.observe(result, {
    attributes: false,
    subtree: false,
    childList: true,
  });

  // Add text after observer is set up => react based on text size.
  // We might refactor it by including `onChildrenUpdate()` to `createG()`.
  result.appendChild(text);

  return result;
}
