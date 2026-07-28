/**
 * Convert a human-readable title to a URL-friendly slug.
 *
 *   titleToSlug("The Turn-Off Ritual")  →  "the-turn-off-ritual"
 *   titleToSlug("Debt Payoff: Snowball Method") → "debt-payoff-snowball-method"
 */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Convert a URL slug back to a title-case heading.
 *
 *   slugToTitle("the-turn-off-ritual")       →  "The Turn Off Ritual"
 *   slugToTitle("debt-payoff-snowball-method") → "Debt Payoff Snowball Method"
 *
 * NOTE: This is a lossy round-trip — colons, ampersands, and other
 * punctuation cannot be recovered. Use it only as a lookup key; always
 * prefer the database `title` for display.
 */
export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
