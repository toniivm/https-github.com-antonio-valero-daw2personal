import { jest } from '@jest/globals';

describe('apiFetch', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('sends JSON body and parses response', async () => {
    window.history.pushState({}, '', '/spotMap/frontend/index.html');
    const { apiFetch } = await import('../js/api.js');

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true })
    });

    const result = await apiFetch('/spots', { method: 'POST', body: { a: 1 } });
    expect(result.success).toBe(true);
    const options = globalThis.fetch.mock.calls[0][1];
    expect(options.method).toBe('POST');
    expect(options.headers.get('Content-Type')).toBe('application/json');
    expect(options.body).toBe(JSON.stringify({ a: 1 }));
  });

  test('throws on non-ok response', async () => {
    window.history.pushState({}, '', '/spotMap/frontend/index.html');
    const { apiFetch } = await import('../js/api.js');

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: { get: () => 'application/json' },
      json: async () => ({ message: 'Bad request' })
    });

    await expect(apiFetch('/spots', { method: 'GET' })).rejects.toThrow('Bad request');
  });
});
