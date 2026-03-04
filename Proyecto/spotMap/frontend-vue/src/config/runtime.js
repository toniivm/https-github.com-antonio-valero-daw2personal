export function detectProjectBase(pathname) {
  const resolvedPathname =
    pathname
    ?? (typeof window !== 'undefined' && window.location ? window.location.pathname : '/');

  const frontendIdx = resolvedPathname.lastIndexOf('/frontend-vue/');
  if (frontendIdx !== -1) {
    return resolvedPathname.substring(0, frontendIdx + 1);
  }

  const spotMapSeg = '/spotMap/';
  const spotIdx = resolvedPathname.indexOf(spotMapSeg);
  if (spotIdx !== -1) {
    return resolvedPathname.substring(0, spotIdx + spotMapSeg.length);
  }

  const lastSlash = resolvedPathname.lastIndexOf('/');
  return lastSlash > 0 ? resolvedPathname.substring(0, lastSlash + 1) : '/';
}

const projectBase = detectProjectBase().replace(/\/+$/, '/');

export const runtimeConfig = {
  apiBase: `${typeof window !== 'undefined' && window.location ? window.location.origin : ''}${projectBase}backend/public/index.php`,
  timeoutMs: 10000,
};
