export interface UserList {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  movie_count: number;
  preview_posters: string[];
  created_at: string;
  updated_at: string;
}

export interface ListMovie {
  id: string;
  list_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  release_date: string | null;
  added_at: string;
}

export interface AddToListParams {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path?: string | null;
  release_date?: string | null;
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

export const listsService = {
  getLists(): Promise<UserList[]> {
    return apiFetch('/api/lists');
  },

  createList(name: string, description?: string): Promise<UserList> {
    return apiFetch('/api/lists', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  },

  getList(id: string): Promise<UserList & { movies: ListMovie[] }> {
    return apiFetch(`/api/lists/${id}`);
  },

  updateList(id: string, data: { name?: string; description?: string }): Promise<UserList> {
    return apiFetch(`/api/lists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteList(id: string): Promise<void> {
    await apiFetch(`/api/lists/${id}`, { method: 'DELETE' });
  },

  addMovie(listId: string, params: AddToListParams): Promise<ListMovie> {
    return apiFetch(`/api/lists/${listId}/movies`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async removeMovie(listId: string, tmdb_id: number, media_type: 'movie' | 'tv'): Promise<void> {
    await apiFetch(`/api/lists/${listId}/movies`, {
      method: 'DELETE',
      body: JSON.stringify({ tmdb_id, media_type }),
    });
  },

  getMovieListIds(tmdb_id: number, media_type: 'movie' | 'tv'): Promise<string[]> {
    return apiFetch(`/api/lists/by-movie?tmdb_id=${tmdb_id}&media_type=${media_type}`);
  },
};
