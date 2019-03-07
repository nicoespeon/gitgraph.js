import { Commit } from "./commit";
import { GitgraphCore } from "./gitgraph";
import { Orientation } from "./orientation";
import { Coordinate } from "./branches-paths";

export {
  Omit,
  NonMatchingPropNames,
  NonMatchingProp,
  booleanOptionOr,
  numberOptionOr,
  pick,
  debug,
  isUndefined,
  withoutUndefinedKeys,
  arrowSvgPath,
};

/**
 * Omit some keys from an original type.
 */
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

/**
 * Get all property names not matching a type.
 *
 * @ref http://tycho01.github.io/typical/modules/_object_nonmatchingpropsnames_.html
 */
type NonMatchingPropNames<T, X> = {
  [K in keyof T]: T[K] extends X ? never : K
}[keyof T];

/**
 * Get all properties with names not matching a type.
 *
 * @ref http://tycho01.github.io/typical/modules/_object_nonmatchingprops_.html
 */
type NonMatchingProp<T, X> = Pick<T, NonMatchingPropNames<T, X>>;

/**
 * Provide a default value to a boolean.
 * @param value
 * @param defaultValue
 */
function booleanOptionOr(value: any, defaultValue: boolean): boolean {
  return typeof value === "boolean" ? value : defaultValue;
}

/**
 * Provide a default value to a number.
 * @param value
 * @param defaultValue
 */
function numberOptionOr(value: any, defaultValue: number): number {
  return typeof value === "number" ? value : defaultValue;
}

/**
 * Creates an object composed of the picked object properties.
 * @param obj The source object
 * @param paths The property paths to pick
 */
function pick<T, K extends keyof T>(obj: T, paths: K[]): Pick<T, K> {
  return {
    ...paths.reduce((mem, key) => ({ ...mem, [key]: obj[key] }), {}),
  } as Pick<T, K>;
}

/**
 * Print a light version of commits into the console.
 * @param commits List of commits
 * @param paths The property paths to pick
 */
function debug<TNode = SVGElement>(
  commits: Array<Commit<TNode>>,
  paths: Array<keyof Commit<TNode>>,
): void {
  // tslint:disable-next-line:no-console
  console.log(
    JSON.stringify(commits.map((commit) => pick(commit, paths)), null, 2),
  );
}

/**
 * Return true if is undefined.
 *
 * @param obj
 */
function isUndefined(obj: any): obj is undefined {
  return obj === undefined;
}

/**
 * Return a version of the object without any undefined keys.
 *
 * @param obj
 */
function withoutUndefinedKeys<T extends object>(
  obj: T = {} as T,
): NonMatchingProp<T, undefined> {
  return (Object.keys(obj) as [keyof T]).reduce<T>(
    (mem: any, key) =>
      isUndefined(obj[key]) ? mem : { ...mem, [key]: obj[key] },
    {} as T,
  );
}

/**
 * Return a string ready to use in `svg.path.d` to draw an arrow from params.
 *
 * @param graph Graph context
 * @param parent Parent commit of the target commit
 * @param commit Target commit
 */
function arrowSvgPath<TNode = SVGElement>(
  graph: GitgraphCore<TNode>,
  parent: Coordinate,
  commit: Commit<TNode>,
): string {
  const commitRadius = commit.style.dot.size;
  const size = graph.template.arrow.size!;
  const h = commitRadius + graph.template.arrow.offset;

  // Delta between left & right (radian)
  const delta = Math.PI / 7;

  // Alpha angle between parent & commit (radian)
  const alpha = getAlpha(graph, parent, commit);

  // Top
  const x1 = h * Math.cos(alpha);
  const y1 = h * Math.sin(alpha);

  // Bottom right
  const x2 = (h + size) * Math.cos(alpha - delta);
  const y2 = (h + size) * Math.sin(alpha - delta);

  // Bottom center
  const x3 = (h + size / 2) * Math.cos(alpha);
  const y3 = (h + size / 2) * Math.sin(alpha);

  // Bottom left
  const x4 = (h + size) * Math.cos(alpha + delta);
  const y4 = (h + size) * Math.sin(alpha + delta);

  return `M${x1},${y1} L${x2},${y2} Q${x3},${y3} ${x4},${y4} L${x4},${y4}`;
}

function getAlpha<TNode = SVGElement>(
  graph: GitgraphCore<TNode>,
  parent: Coordinate,
  commit: Commit<TNode>,
): number {
  const deltaX = parent.x - commit.x;
  const deltaY = parent.y - commit.y;
  const commitSpacing = graph.template.commit.spacing;

  let alphaY;
  let alphaX;

  // Angle usually start from previous commit Y position:
  //
  // o
  // ↑ ↖ ︎
  // o  |  <-- path is straight until last commit Y position
  // ↑  o
  // | ↗︎
  // o
  //
  // So we can to default to commit spacing.
  // For horizontal orientation => same with commit X position.
  switch (graph.orientation) {
    case Orientation.Horizontal:
      alphaY = deltaY;
      alphaX = -commitSpacing;
      break;

    case Orientation.HorizontalReverse:
      alphaY = deltaY;
      alphaX = commitSpacing;
      break;

    case Orientation.VerticalReverse:
      alphaY = -commitSpacing;
      alphaX = deltaX;
      break;

    default:
      alphaY = commitSpacing;
      alphaX = deltaX;
      break;
  }

  // If commit is distant from its parent, there should be no angle.
  //
  //    o ︎
  //    ↑  <-- arrow is like previous commit was on same X position
  // o  |
  // | /
  // o
  //
  // For horizontal orientation => same with commit Y position.
  if (graph.isVertical) {
    if (Math.abs(deltaY) > commitSpacing) alphaX = 0;
  } else {
    if (Math.abs(deltaX) > commitSpacing) alphaY = 0;
  }

  if (graph.reverseArrow) {
    alphaY *= -1;
    alphaX *= -1;
  }

  return Math.atan2(alphaY, alphaX);
}
