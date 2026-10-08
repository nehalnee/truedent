// Prefixes site-relative paths with the deploy base, e.g. "/truedent" on GitHub Pages
// and "" when the site is served from a domain root.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function u(path: string) {
  if (!base || !path.startsWith('/') || path === base || path.startsWith(`${base}/`)) return path;
  return base + path;
}

/** The current path without the deploy base, for "active link" checks. */
export function stripBase(path: string) {
  return base && path.startsWith(base) ? path.slice(base.length) || '/' : path;
}
