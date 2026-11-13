/** Removes HTML tags and control characters, normalizes whitespace at the ends. */
export function plainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    // Windows (\r\n) and old Mac (\r) line breaks both become \n.
    .replace(/\r\n?/g, "\n")
    .trim();
}
