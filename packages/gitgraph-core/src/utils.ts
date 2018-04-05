import { Commit } from "./commit";
import { Coordinate } from "./gitgraph";

/**
 * Omit some keys from an original type.
 */
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

/**
 * Get all property names not matching a type.
 *
 * @ref http://tycho01.github.io/typical/modules/_object_nonmatchingpropsnames_.html
 */
export type NonMatchingPropNames<T, X> = { [K in keyof T]: T[K] extends X ? never : K; }[keyof T];

/**
 * Get all properties with names not matching a type.
 *
 * @ref http://tycho01.github.io/typical/modules/_object_nonmatchingprops_.html
 */
export type NonMatchingProp<T, X> = Pick<T, NonMatchingPropNames<T, X>>;

/**
 * Provide a default value to a boolean.
 * @param value
 * @param defaultValue
 */
export function booleanOptionOr(value: any, defaultValue: boolean): boolean {
  return typeof value === "boolean" ? value : defaultValue;
}

/**
 * Provide a default value to a number.
 * @param value
 * @param defaultValue
 */
export function numberOptionOr(value: any, defaultValue: number | null): number | null {
  return typeof value === "number" ? value : defaultValue;
}

/**
 * Creates an object composed of the picked object properties.
 * @param obj The source object
 * @param paths The property paths to pick
 */
export function pick<T, K extends keyof T>(obj: T, paths: K[]): Pick<T, K> {
  return { ...paths.reduce((mem, key) => ({ ...mem, [key]: obj[key] }), {}) } as Pick<T, K>;
}

/**
 * Print a light version of commits into the console.
 * @param commits List of commits
 * @param paths The property paths to pick
 */
export function debug(commits: Commit[], paths: Array<keyof Commit>): void {
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
export function isUndefined(obj: any): obj is undefined {
  return obj === undefined;
}

/**
 * Return a version of the object without any undefined keys.
 *
 * @param obj
 */
export function withoutUndefinedKeys<T extends object>(obj: T = {} as T)
  : NonMatchingProp<T, undefined> {
  return (Object.keys(obj) as [keyof T])
    .reduce<T>((mem: any, key) => isUndefined(obj[key]) ? mem : { ...mem, [key]: obj[key] }, {} as T);
}

/**
 * Return a string ready to use in `svg.path.d` from coordinates
 *
 * @param coordinates Collection of coordinates
 */
export function toSvgPath(coordinates: Coordinate[]): string {
  return "M" + coordinates.map(({ x, y }) => `L ${x} ${y}`).join(" ").slice(1);
}
