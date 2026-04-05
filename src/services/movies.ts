// Services pour interagir avec l'API locale (PostgreSQL)

export interface UserMovie {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  release_date: string | null;
  status: 'watched' | 'watchlist';
  rating: number | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddMovieParams {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  release_date: string | null;
  status: 'watched' | 'watchlist';
  rating?: number | null;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Erreur API: ${res.status}`);
  }
  return res.json();
}

export const moviesService = {
  async getUserMovies(): Promise<UserMovie[]> {
    return apiFetch('/api/movies');
  },

  async getWatchedMovies(): Promise<UserMovie[]> {
    const movies = await apiFetch<UserMovie[]>('/api/movies');
    return movies.filter((m) => m.status === 'watched');
  },

  async getWatchlist(): Promise<UserMovie[]> {
    const movies = await apiFetch<UserMovie[]>('/api/movies');
    return movies.filter((m) => m.status === 'watchlist');
  },

  async getMovieByTmdbId(tmdb_id: number, media_type: 'movie' | 'tv'): Promise<UserMovie | null> {
    return apiFetch(`/api/movies/by-tmdb/${tmdb_id}?media_type=${media_type}`);
  },

  async addMovie(params: AddMovieParams): Promise<UserMovie> {
    return apiFetch('/api/movies', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async updateMovie(id: string, updates: Partial<Pick<UserMovie, 'status' | 'rating' | 'is_favorite'>>): Promise<UserMovie> {
    return apiFetch(`/api/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteMovie(id: string): Promise<void> {
    await apiFetch(`/api/movies/${id}`, { method: 'DELETE' });
  },

  async upsertMovie(params: AddMovieParams): Promise<UserMovie> {
    return apiFetch('/api/movies/upsert', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async getStats() {
    return apiFetch<{ watched: number; watchlist: number; favorites: number; thisWeek: number }>('/api/movies/stats');
  },

  async getFavorites(): Promise<UserMovie[]> {
    return apiFetch('/api/movies/favorites');
  },

  async toggleFavorite(id: string): Promise<UserMovie> {
    return apiFetch(`/api/movies/${id}/favorite`, { method: 'POST' });
  },

  async getFavoritesCount(): Promise<number> {
    const data = await apiFetch<{ count: number }>('/api/movies/favorites/count');
    return data.count;
  },

  async addSkippedMovie(tmdb_id: number, media_type: 'movie' | 'tv'): Promise<void> {
    await apiFetch('/api/movies/skipped', {
      method: 'POST',
      body: JSON.stringify({ tmdb_id, media_type }),
    });
  },

  async getSkippedMovieIds(): Promise<number[]> {
    return apiFetch('/api/movies/skipped');
  },

  async removeSkippedMovie(tmdb_id: number, media_type: 'movie' | 'tv'): Promise<void> {
    await apiFetch('/api/movies/skipped', {
      method: 'DELETE',
      body: JSON.stringify({ tmdb_id, media_type }),
    });
  },
};
