// config.js - Dynamic configuration for SpotMap frontend
// Detect base path automatically relative to current location.
// Allows running under subdirectories without manual edits.

export const Config = (() => {
  const loc = window.location;

  // Robust project base detection
  // Priority:
  // 1) If current path contains '/frontend/', take everything before it as project base
  // 2) Else, try to detect '/spotMap/' segment
  // 3) Fallback to current directory
  const path = loc.pathname;
  let projectBase = '/';

  const frontendIdx = path.lastIndexOf('/frontend/');
  if (frontendIdx !== -1) {
    projectBase = path.substring(0, frontendIdx + 1); // include trailing '/'
  } else {
    const spotMapSeg = '/spotMap/';
    const spotIdx = path.indexOf(spotMapSeg);
    if (spotIdx !== -1) {
      projectBase = path.substring(0, spotIdx + spotMapSeg.length);
    } else {
      // Use current directory as base
      const lastSlash = path.lastIndexOf('/');
      projectBase = lastSlash > 0 ? path.substring(0, lastSlash + 1) : '/';
    }
  }

  // Normalize duplicate slashes
  projectBase = projectBase.replace(/\/+$/, '/');

  // Backend public entry (index.php) assumed at backend/public/index.php
  const backendBase = loc.origin + projectBase + 'backend/public/index.php';

  return {
    apiBase: backendBase,
    timeoutMs: 10000,
    version: '1.0.1-pro',
  };
})();

export function buildApiUrl(endpoint) {
  // Ensure leading slash
  const ep = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  return Config.apiBase + ep;
}
