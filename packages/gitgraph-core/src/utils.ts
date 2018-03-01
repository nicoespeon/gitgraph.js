import { Commit } from "./commit";

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
