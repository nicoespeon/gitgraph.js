export {
  createSvg,
  createG,
  createText,
  createCircle,
  createRect,
  createPath,
  createUse,
  createClipPath,
  createDefs,
  createForeignObject,
};

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

  if (options.onClick) {
    text.addEventListener("click", options.onClick);
  }

  return text;
}

interface CircleOptions {
  radius: number;
  id?: string;
  fill?: string;
}

function createCircle(options: CircleOptions): SVGCircleElement {
  const circle = document.createElementNS(SVG_NAMESPACE, "circle");
  circle.setAttribute("cx", options.radius.toString());
  circle.setAttribute("cy", options.radius.toString());
  circle.setAttribute("r", options.radius.toString());

  if (options.id) {
    circle.setAttribute("id", options.id);
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
    rect.setAttribute("fill", options.fill || "none");
  }

  if (options.stroke) {
    rect.setAttribute("stroke", options.stroke);
  }

  return rect;
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

function createUse(href: string): SVGUseElement {
  const use = document.createElementNS(SVG_NAMESPACE, "use");
  use.setAttribute("href", `#${href}`);
  // xlink:href is deprecated in SVG2, but we keep it for retro-compatibility
  // => https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use#Browser_compatibility
  use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${href}`);

  return use;
}

function createClipPath(): SVGClipPathElement {
  return document.createElementNS(SVG_NAMESPACE, "clipPath");
}

function createDefs(children: SVGElement[]): SVGDefsElement {
  const defs = document.createElementNS(SVG_NAMESPACE, "defs");
  children.forEach((child) => defs.appendChild(child));

  return defs;
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
