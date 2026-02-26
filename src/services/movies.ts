// Services pour interagir avec Supabase pour les films de l'utilisateur

import { SupabaseClient } from '@supabase/supabase-js';

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

export const moviesService = {
  // Récupérer tous les films de l'utilisateur
  async getUserMovies(supabase: SupabaseClient): Promise<UserMovie[]> {
    const { data, error } = await supabase
      .from('user_movies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user movies:', error);
      throw error;
    }

    return data || [];
  },

  // Récupérer les films vus
  async getWatchedMovies(supabase: SupabaseClient): Promise<UserMovie[]> {
    const { data, error } = await supabase
      .from('user_movies')
      .select('*')
      .eq('status', 'watched')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching watched movies:', error);
      throw error;
    }

    return data || [];
  },

  // Récupérer la watchlist
  async getWatchlist(supabase: SupabaseClient): Promise<UserMovie[]> {
    const { data, error } = await supabase
      .from('user_movies')
      .select('*')
      .eq('status', 'watchlist')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching watchlist:', error);
      throw error;
    }

    return data || [];
  },

  // Vérifier si un film existe déjà pour l'utilisateur
  async getMovieByTmdbId(
    supabase: SupabaseClient,
    tmdb_id: number,
    media_type: 'movie' | 'tv'
  ): Promise<UserMovie | null> {
    const { data, error } = await supabase
      .from('user_movies')
      .select('*')
      .eq('tmdb_id', tmdb_id)
      .eq('media_type', media_type)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching movie:', error);
      throw error;
    }

    return data;
  },

  // Ajouter un film
  async addMovie(supabase: SupabaseClient, params: AddMovieParams): Promise<UserMovie> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_movies')
      .insert({
        user_id: user.id,
        ...params,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding movie:', error);
      throw error;
    }

    return data;
  },

  // Mettre à jour un film
  async updateMovie(
    supabase: SupabaseClient,
    id: string,
    updates: Partial<Pick<UserMovie, 'status' | 'rating' | 'is_favorite'>>
  ): Promise<UserMovie> {
    const { data, error } = await supabase
      .from('user_movies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating movie:', error);
      throw error;
    }

    return data;
  },

  // Supprimer un film
  async deleteMovie(supabase: SupabaseClient, id: string): Promise<void> {
    const { error } = await supabase
      .from('user_movies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting movie:', error);
      throw error;
    }
  },

  // Mettre à jour ou créer un film (upsert)
  async upsertMovie(supabase: SupabaseClient, params: AddMovieParams): Promise<UserMovie> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Vérifier si le film existe déjà
    const existing = await this.getMovieByTmdbId(supabase, params.tmdb_id, params.media_type);

    if (existing) {
      // Mettre à jour
      return this.updateMovie(supabase, existing.id, {
        status: params.status,
        rating: params.rating,
      });
    } else {
      // Créer
      return this.addMovie(supabase, params);
    }
  },

  // Obtenir les statistiques
  async getStats(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Nombre de films vus
    const { count: watchedCount } = await supabase
      .from('user_movies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'watched');

    // Nombre dans la watchlist
    const { count: watchlistCount } = await supabase
      .from('user_movies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'watchlist');

    // Films avec note 5
    const { count: favoritesCount } = await supabase
      .from('user_movies')
      .select('*', { count: 'exact', head: true })
      .eq('rating', 5);

    // Films vus cette semaine
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { count: thisWeekCount } = await supabase
      .from('user_movies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'watched')
      .gte('created_at', oneWeekAgo.toISOString());

    return {
      watched: watchedCount || 0,
      watchlist: watchlistCount || 0,
      favorites: favoritesCount || 0,
      thisWeek: thisWeekCount || 0,
    };
  },

  // Récupérer les films favoris
  async getFavorites(supabase: SupabaseClient): Promise<UserMovie[]> {
    const { data, error } = await supabase
      .from('user_movies')
      .select('*')
      .eq('is_favorite', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }

    return data || [];
  },

  // Basculer le statut favori d'un film
  async toggleFavorite(supabase: SupabaseClient, id: string): Promise<UserMovie> {
    // Récupérer le film actuel
    const { data: currentMovie, error: fetchError } = await supabase
      .from('user_movies')
      .select('is_favorite')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching movie:', fetchError);
      throw fetchError;
    }

    // Inverser le statut
    const newFavoriteStatus = !currentMovie.is_favorite;

    const { data, error } = await supabase
      .from('user_movies')
      .update({ is_favorite: newFavoriteStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Si l'erreur est due à la limite de favoris
      if (error.message?.includes('10 films favoris maximum')) {
        throw new Error('Vous ne pouvez avoir que 10 films favoris maximum');
      }
      console.error('Error toggling favorite:', error);
      throw error;
    }

    return data;
  },

  // Compter le nombre de favoris
  async getFavoritesCount(supabase: SupabaseClient): Promise<number> {
    const { count, error } = await supabase
      .from('user_movies')
      .select('*', { count: 'exact', head: true })
      .eq('is_favorite', true);

    if (error) {
      console.error('Error counting favorites:', error);
      throw error;
    }

    return count || 0;
  },
};
