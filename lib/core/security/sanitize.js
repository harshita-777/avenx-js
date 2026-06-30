/**
 * Provides sanitization for values used in templates.
 * Currently a placeholder for more advanced sanitization logic.
 */
export class Sanitizer {
  /**
   * Sanitizes a value.
   * @param {any} value - The value to sanitize.
   * @returns {string} The sanitized string.
   */
  sanitize(value) {
    return value == null ? '' : String(value);
  }
}
