/** Escape special characters in SQL LIKE patterns */
export function escapeLike(str: string): string {
  return str.replace(/[\\%_]/g, '\\$&');
}

/** Escape HTML special characters to prevent XSS */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
