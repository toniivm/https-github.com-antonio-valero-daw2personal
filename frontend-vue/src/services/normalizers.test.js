import { describe, expect, it } from 'vitest';
import { normalizeSpot, normalizeTags, filterValidCoords } from './normalizers';

describe('normalizeTags', () => {
  it('acepta array de strings', () => {
    expect(normalizeTags(['tag1', 'tag2'])).toEqual(['tag1', 'tag2']);
  });

  it('acepta string separado por comas', () => {
    expect(normalizeTags('tag1, tag2 , tag3')).toEqual(['tag1', 'tag2', 'tag3']);
  });

  it('devuelve array vacío para null/undefined', () => {
    expect(normalizeTags(null)).toEqual([]);
    expect(normalizeTags(undefined)).toEqual([]);
  });

  it('filtra strings vacíos', () => {
    expect(normalizeTags(['tag1', '', '  '])).toEqual(['tag1']);
  });
});

describe('normalizeSpot', () => {
  it('normaliza un spot con todos los campos', () => {
    const raw = {
      id: 42,
      user_id: 'u-1',
      title: '  Spot Test  ',
      description: 'Descripción',
      category: 'playa',
      lat: 43.0,
      lng: -8.0,
      tags: ['tag1'],
      imagePath: '/img/spot.jpg',
      status: 'approved',
    };
    const result = normalizeSpot(raw);
    expect(result.id).toBe(42);
    expect(result.userId).toBe('u-1');
    expect(result.title).toBe('Spot Test');
    expect(result.lat).toBe(43.0);
    expect(result.lng).toBe(-8.0);
    expect(result.tags).toEqual(['tag1']);
    expect(result.imagePath.endsWith('/img/spot.jpg')).toBe(true);
    expect(result.status).toBe('approved');
  });

  it('usa latitude/longitude como fallback de lat/lng', () => {
    const raw = { id: 1, title: 'T', latitude: 40.0, longitude: -3.0, tags: [] };
    const result = normalizeSpot(raw);
    expect(result.lat).toBe(40.0);
    expect(result.lng).toBe(-3.0);
  });

  it('usa image_path como fallback de imagePath', () => {
    const raw = { id: 1, title: 'T', lat: 0, lng: 0, tags: [], image_path: '/img/test.jpg' };
    const result = normalizeSpot(raw);
    expect(result.imagePath.endsWith('/img/test.jpg')).toBe(true);
  });

  it('maneja campos nulos sin lanzar error', () => {
    const result = normalizeSpot({});
    expect(result.title).toBe('');
    expect(result.tags).toEqual([]);
    expect(result.imagePath).toBe('');
  });
});

describe('filterValidCoords', () => {
  it('filtra spots sin coordenadas válidas', () => {
    const spots = [
      { lat: 43.0, lng: -8.0 },
      { lat: null, lng: -8.0 },
      { lat: NaN, lng: NaN },
      { lat: 42.0, lng: -7.0 },
    ];
    expect(filterValidCoords(spots)).toHaveLength(2);
  });
});
