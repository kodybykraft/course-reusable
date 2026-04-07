/** Generate a URL-safe slug from a string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Generate a unique slug by appending a random suffix */
export function uniqueSlug(text: string): string {
  const base = slugify(text);
  const suffix = crypto.randomUUID().substring(0, 8);
  return `${base}-${suffix}`;
}
