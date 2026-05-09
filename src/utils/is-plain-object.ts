/**
 * Determines whether a value is a plain object.
 *
 * @param value - Value to evaluate
 * @returns true when value is a non-null object, not an array, and its prototype is Object.prototype or null
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
