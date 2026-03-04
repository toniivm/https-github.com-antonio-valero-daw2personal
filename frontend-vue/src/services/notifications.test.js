import { describe, expect, it } from 'vitest';
import { formatTimeAgo, getNotificationIcon, isSupabaseRequiredError } from './notifications';

describe('notifications helpers', () => {
  it('mapea iconos por tipo', () => {
    expect(getNotificationIcon('spot_approved')).toBe('✅');
    expect(getNotificationIcon('spot_rejected')).toBe('❌');
    expect(getNotificationIcon('spot_comment')).toBe('💬');
    expect(getNotificationIcon('spot_like')).toBe('❤️');
    expect(getNotificationIcon('system')).toBe('ℹ️');
    expect(getNotificationIcon('unknown')).toBe('🔔');
  });

  it('detecta errores de backend sin supabase', () => {
    expect(isSupabaseRequiredError(new Error('Notifications require Supabase backend'))).toBe(true);
    expect(isSupabaseRequiredError(new Error('Another error'))).toBe(false);
  });

  it('formatea tiempo relativo', () => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60000).toISOString();
    const twoHoursAgo = new Date(now.getTime() - 2 * 3600000).toISOString();

    expect(formatTimeAgo(tenMinutesAgo)).toBe('Hace 10 min');
    expect(formatTimeAgo(twoHoursAgo)).toBe('Hace 2h');
  });
});