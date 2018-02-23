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
