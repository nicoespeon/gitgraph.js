import * as React from "react";
import { createRef, useLayoutEffect } from "react";

export {
  GraphContainer,
  createFixedHashGenerator,
  createSvg,
  createG,
  createText,
  createPath,
  createForeignObject,
};

export const hashPrefix = "h45h";
function createFixedHashGenerator() {
  let hashIndex = 0;
  return () => `${hashPrefix}${hashIndex++}`;
}

/**
 * A React container to wrap HTMLElement so we can render @gitgraph/js
 * stories with @storybook/react.
 * We need to because Chromatic QA only handle 1 Storybook / repo.
 * And Storybook doesn't run multiple frameworks in 1 Storybook (yet).
 * See https://github.com/storybooks/storybook/issues/3994
 */
function GraphContainer(props: {
  children: (graphContainer: HTMLElement) => void;
}) {
  const graphContainer = createRef<HTMLDivElement>();

  useLayoutEffect(() => {
    if (graphContainer.current) {
      props.children(graphContainer.current);
    }
  });

  return <div ref={graphContainer} />;
}

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

interface SVGOptions {
  viewBox?: string;
  height?: number;
  width?: number;
  children?: SVGElement[];
}

function createSvg(options?: SVGOptions): SVGSVGElement {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  if (!options) return svg;

  if (options.children) {
    options.children.forEach((child) => svg.appendChild(child));
  }

  if (options.viewBox) {
    svg.setAttribute("viewBox", options.viewBox);
  }

  if (options.height) {
    svg.setAttribute("height", options.height.toString());
  }

  if (options.width) {
    svg.setAttribute("width", options.width.toString());
  }

  return svg;
}

interface GOptions {
  children: Array<SVGElement | null>;
  translate?: {
    x: number;
    y: number;
  };
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  onClick?: () => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
}

function createG(options: GOptions): SVGGElement {
  const g = document.createElementNS(SVG_NAMESPACE, "g");
  options.children.forEach((child) => child && g.appendChild(child));

  if (options.translate) {
    g.setAttribute(
      "transform",
      `translate(${options.translate.x}, ${options.translate.y})`,
    );
  }

  if (options.fill) {
    g.setAttribute("fill", options.fill);
  }

  if (options.stroke) {
    g.setAttribute("stroke", options.stroke);
  }

  if (options.strokeWidth) {
    g.setAttribute("stroke-width", options.strokeWidth.toString());
  }

  if (options.onClick) {
    g.addEventListener("click", options.onClick);
  }

  if (options.onMouseOver) {
    g.addEventListener("mouseover", options.onMouseOver);
  }

  if (options.onMouseOut) {
    g.addEventListener("mouseout", options.onMouseOut);
  }

  return g;
}

interface TextOptions {
  content: string;
  fill?: string;
  font?: string;
  anchor?: "start" | "middle" | "end";
  translate?: {
    x: number;
    y: number;
  };
  rotate?: number;
  onClick?: () => void;
}

function createText(options: TextOptions): SVGTextElement {
  const text = document.createElementNS(SVG_NAMESPACE, "text");
  text.setAttribute("alignment-baseline", "central");
  text.setAttribute("dominant-baseline", "central");
  text.textContent = options.content;

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

  if (options.rotate) {
    text.setAttribute("transform", `rotate(${options.rotate})`);
  }

  if (options.onClick) {
    text.addEventListener("click", options.onClick);
  }

  return text;
}

interface PathOptions {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  translate?: {
    x: number;
    y: number;
  };
}

function createPath(options: PathOptions): SVGPathElement {
  const path = document.createElementNS(SVG_NAMESPACE, "path");
  path.setAttribute("d", options.d);

  if (options.fill) {
    path.setAttribute("fill", options.fill);
  }

  if (options.stroke) {
    path.setAttribute("stroke", options.stroke);
  }

  if (options.strokeWidth) {
    path.setAttribute("stroke-width", options.strokeWidth.toString());
  }

  if (options.translate) {
    path.setAttribute(
      "transform",
      `translate(${options.translate.x}, ${options.translate.y})`,
    );
  }

  return path;
}

interface ForeignObjectOptions {
  content: string;
  width: number;
  translate?: {
    x: number;
    y: number;
  };
}

function createForeignObject(
  options: ForeignObjectOptions,
): SVGForeignObjectElement {
  const result = document.createElementNS(SVG_NAMESPACE, "foreignObject");
  result.setAttribute("width", options.width.toString());

  if (options.translate) {
    result.setAttribute("x", options.translate.x.toString());
    result.setAttribute("y", options.translate.y.toString());
  }

  const p = document.createElement("p");
  p.textContent = options.content;
  result.appendChild(p);

  return result;
}
