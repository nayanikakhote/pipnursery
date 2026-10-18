// Every public asset goes through here so the site works from any base path
// (root domain, a project sub-path, a file:// preview).
const BASE = import.meta.env.BASE_URL || '/';

export function asset(path: string): string {
  return BASE.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}
