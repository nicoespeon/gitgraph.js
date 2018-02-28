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
 * Print a light version of commits into the console.
 * @param commits List of commits
 * @param whitelist List of picked keys
 */
export function debug(commits: Commit[], whitelist: Array<keyof Commit>): void {
  // tslint:disable-next-line:no-console
  console.log(
    JSON.stringify(commits.map((commit) =>
      (Object.keys(commit) as Array<keyof Commit>)
        .filter((key) => whitelist.includes(key))
        .reduce((mem, key) => ({ ...mem, [key]: commit[key] }), {}))
      , null, 2),
  );
}
