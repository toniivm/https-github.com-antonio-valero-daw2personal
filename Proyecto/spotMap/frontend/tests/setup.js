import { jest } from '@jest/globals';

globalThis.fetch = jest.fn();

afterEach(() => {
  if (globalThis.fetch && globalThis.fetch.mockClear) {
    globalThis.fetch.mockClear();
  }
});
