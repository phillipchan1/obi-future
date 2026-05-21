export const REPO_NAME = "obi-future";

/** GitHub Actions Pages serves at site root; org project URL uses /repo-name/. */
export function getRouterBasename(): string {
  const prefix = `/${REPO_NAME}`;
  return window.location.pathname.startsWith(prefix) ? prefix : "/";
}
