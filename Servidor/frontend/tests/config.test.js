import { jest } from '@jest/globals';

describe('config', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('buildApiUrl uses frontend segment', async () => {
    window.history.pushState({}, '', '/spotMap/frontend/index.html');
    const { buildApiUrl, Config } = await import('../js/config.js');
    expect(Config.apiBase).toBe('http://localhost/spotMap/backend/public/index.php');
    expect(buildApiUrl('/spots')).toBe('http://localhost/spotMap/backend/public/index.php/spots');
  });

  test('buildApiUrl uses spotMap segment', async () => {
    window.history.pushState({}, '', '/spotMap/index.html');
    const { buildApiUrl } = await import('../js/config.js');
    expect(buildApiUrl('spots')).toBe('http://localhost/spotMap/backend/public/index.php/spots');
  });
});
