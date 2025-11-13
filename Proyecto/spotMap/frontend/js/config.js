// config.js - Dynamic configuration for SpotMap frontend
// Detect base path automatically relative to current location.
// Allows running under subdirectories without manual edits.

export const Config = (() => {
  const loc = window.location;
  // Heuristic: assume frontend/ is sibling of backend/; build backend base.
  // If URL contains 'Proyecto/spotMap', reuse that path.
  const pathMatch = loc.pathname.match(/\/(?:.+\/)*Proyecto\/spotMap\//);
  const basePath = pathMatch ? pathMatch[0] : '/';
  // Backend public entry (index.php) assumed at backend/public/index.php
  const backendBase = loc.origin + basePath + 'backend/public/index.php';

  return {
    apiBase: backendBase,
    timeoutMs: 10000,
    version: '1.0.0-pro',
  };
})();

export function buildApiUrl(endpoint) {
  // Ensure leading slash
  const ep = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  return Config.apiBase + ep;
}
