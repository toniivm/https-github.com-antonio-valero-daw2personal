import { describe, expect, it } from 'vitest';
import { detectProjectBase } from './runtime';

describe('detectProjectBase', () => {
  it('resolves base when frontend-vue is in path', () => {
    const result = detectProjectBase('/spotMap/frontend-vue/index.html');
    expect(result).toBe('/spotMap/');
  });

  it('falls back to spotMap segment when frontend-vue segment is absent', () => {
    const result = detectProjectBase('/foo/bar/spotMap/anything/here');
    expect(result).toBe('/foo/bar/spotMap/');
  });

  it('falls back to current directory for generic paths', () => {
    const result = detectProjectBase('/custom/path/file.html');
    expect(result).toBe('/custom/path/');
  });
});
