import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useSpotsStore } from './spots';
import { apiFetch } from '../services/api';

vi.mock('../services/api', () => ({
  apiFetch: vi.fn(),
}));

const apiResponse = {
  data: {
    spots: [
      {
        id: 1,
        title: 'Mirador Sol',
        category: 'landscape',
        description: 'Amanecer en montaña',
        latitude: 40.4,
        longitude: -3.7,
        schedule: 'sunrise',
        difficulty: 'easy',
        season: 'spring',
        tags: ['sunrise', 'easy', 'spring'],
      },
      {
        id: 2,
        title: 'Skyline Nocturno',
        category: 'urban',
        description: 'Larga exposición',
        latitude: 41.3,
        longitude: 2.1,
        schedule: 'night',
        difficulty: 'hard',
        season: 'winter',
        tags: ['night', 'hard', 'winter'],
      },
    ],
    pagination: {
      page: 1,
      pages: 1,
      total: 2,
    },
  },
};

describe('spots store photographic filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    apiFetch.mockResolvedValue(apiResponse);
  });

  it('sends best_time, difficulty and season in API query params', async () => {
    const store = useSpotsStore();

    await store.setBestTimeFilter('sunrise');
    await store.setDifficultyFilter('easy');
    await store.setSeasonFilter('spring');

    const calls = apiFetch.mock.calls.map((call) => call[0]);
    const lastCall = calls[calls.length - 1];

    expect(lastCall).toContain('/spots?');
    expect(lastCall).toContain('best_time=sunrise');
    expect(lastCall).toContain('difficulty=easy');
    expect(lastCall).toContain('season=spring');
  });

  it('applies local filteredSpots with photographic filters', async () => {
    const store = useSpotsStore();

    await store.loadSpots();
    await store.setBestTimeFilter('night');
    await store.setDifficultyFilter('hard');
    await store.setSeasonFilter('winter');

    expect(store.filteredSpots).toHaveLength(1);
    expect(store.filteredSpots[0].title).toBe('Skyline Nocturno');
  });

  it('creates spot with token and normalized payload', async () => {
    const store = useSpotsStore();
    apiFetch.mockResolvedValueOnce({ success: true, data: { id: 999 } });
    apiFetch.mockResolvedValueOnce(apiResponse);

    await store.createSpot({
      title: 'Nuevo spot',
      description: 'Desc',
      lat: '40.5',
      lng: '-3.6',
      image_path: 'https://example.com/spot.jpg',
      category: 'landscape',
      tags: 'sunrise, mountain',
      schedule: 'sunrise',
      difficulty: 'easy',
      season: 'spring',
    }, 'token-123');

    expect(apiFetch).toHaveBeenNthCalledWith(1, '/spots', {
      method: 'POST',
      token: 'token-123',
      body: {
        title: 'Nuevo spot',
        description: 'Desc',
        lat: 40.5,
        lng: -3.6,
        image_path: 'https://example.com/spot.jpg',
        category: 'landscape',
        tags: ['sunrise', 'mountain'],
        schedule: 'sunrise',
        difficulty: 'easy',
        season: 'spring',
      },
    });
  });

  it('updates spot with token and normalized payload', async () => {
    const store = useSpotsStore();
    apiFetch.mockResolvedValueOnce({ success: true, data: { id: 5 } });
    apiFetch.mockResolvedValueOnce(apiResponse);

    await store.updateSpot(5, {
      title: 'Spot editado',
      description: 'Desc editada',
      lat: '40.6',
      lng: '-3.7',
      image_path: 'https://example.com/new.jpg',
      category: 'urban',
      tags: ['night', 'city'],
      schedule: 'night',
      difficulty: 'medium',
      season: 'winter',
    }, 'token-321');

    expect(apiFetch).toHaveBeenNthCalledWith(1, '/spots/5', {
      method: 'PUT',
      token: 'token-321',
      body: {
        title: 'Spot editado',
        description: 'Desc editada',
        lat: 40.6,
        lng: -3.7,
        image_path: 'https://example.com/new.jpg',
        category: 'urban',
        tags: ['night', 'city'],
        schedule: 'night',
        difficulty: 'medium',
        season: 'winter',
      },
    });
  });

  it('loads social info for selected spot', async () => {
    const store = useSpotsStore();
    apiFetch
      .mockResolvedValueOnce({ data: { comments: [{ id: 1, content: 'Buen spot', user_id: 'u1' }] } })
      .mockResolvedValueOnce({ data: { count: 3, average: 4.5 } })
      .mockResolvedValueOnce({ data: { favorites: [{ user_id: 'u1' }, { user_id: 'u2' }], count: 2 } });

    await store.loadSpotSocial(99, 'u1');

    expect(store.selectedComments).toHaveLength(1);
    expect(store.ratingAggregate.average).toBe(4.5);
    expect(store.favoritesCount).toBe(2);
    expect(store.isFavoritedByUser).toBe(true);
  });

  it('sends favorite/rate/comment actions and reloads social data', async () => {
    const store = useSpotsStore();

    apiFetch
      .mockResolvedValueOnce({ data: { comments: [] } })
      .mockResolvedValueOnce({ data: { count: 0, average: 0 } })
      .mockResolvedValueOnce({ data: { favorites: [], count: 0 } });
    await store.loadSpotSocial(99, 'u1');

    apiFetch
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ data: { comments: [] } })
      .mockResolvedValueOnce({ data: { count: 0, average: 0 } })
      .mockResolvedValueOnce({ data: { favorites: [{ user_id: 'u1' }], count: 1 } });
    await store.toggleFavorite(99, 'token-x', 'u1');

    apiFetch
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ data: { comments: [] } })
      .mockResolvedValueOnce({ data: { count: 1, average: 5 } })
      .mockResolvedValueOnce({ data: { favorites: [{ user_id: 'u1' }], count: 1 } });
    await store.rateSpot(99, 5, 'token-x', 'u1');

    apiFetch
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ data: { comments: [{ id: 7, content: 'Top' }] } })
      .mockResolvedValueOnce({ data: { count: 1, average: 5 } })
      .mockResolvedValueOnce({ data: { favorites: [{ user_id: 'u1' }], count: 1 } });
    await store.addComment(99, 'Top', 'token-x', 'u1');

    expect(apiFetch).toHaveBeenCalledWith('/spots/99/favorite', { method: 'POST', token: 'token-x' });
    expect(apiFetch).toHaveBeenCalledWith('/spots/99/rate', { method: 'POST', token: 'token-x', body: { score: 5 } });
    expect(apiFetch).toHaveBeenCalledWith('/spots/99/comments', { method: 'POST', token: 'token-x', body: { body: 'Top' } });
  });
});