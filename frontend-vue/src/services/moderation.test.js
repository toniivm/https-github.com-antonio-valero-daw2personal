import { describe, expect, it } from 'vitest';
import { isModerationUnsupported } from './moderation';

describe('moderation helpers', () => {
  it('detecta backend sin supabase para moderación', () => {
    expect(isModerationUnsupported(new Error('Moderation requires Supabase backend'))).toBe(true);
    expect(isModerationUnsupported(new Error('Forbidden'))).toBe(false);
  });
});