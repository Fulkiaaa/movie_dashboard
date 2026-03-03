// Services pour interagir avec l'API TMDB

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  media_type: 'movie' | 'tv';
  genre_ids: number[];
}

export interface MovieDetails extends Movie {
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres: { id: number; name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { iso_639_1: string; name: string }[];
}

export const tmdbService = {
  // Recherche multi (films et séries)
  async searchMulti(query: string, page = 1): Promise<{ results: Movie[]; total_pages: number }> {
    if (!query.trim()) {
      return { results: [], total_pages: 0 };
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=fr-FR&include_adult=false`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la recherche');
    }

    const data = await response.json();
    
    // Filtrer pour ne garder que les films et séries
    const filteredResults = data.results.filter(
      (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
    );

    return {
      results: filteredResults,
      total_pages: data.total_pages,
    };
  },

  // Récupérer les détails d'un film
  async getMovieDetails(id: number): Promise<MovieDetails> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=fr-FR`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des détails');
    }

    const data = await response.json();
    return { ...data, media_type: 'movie' };
  },

  // Récupérer les détails d'une série
  async getTVDetails(id: number): Promise<MovieDetails> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=fr-FR`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des détails');
    }

    const data = await response.json();
    return { ...data, media_type: 'tv' };
  },

  // Récupérer les films populaires
  async getPopularMovies(page = 1): Promise<{ results: Movie[]; total_pages: number }> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}&language=fr-FR`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des films populaires');
    }

    const data = await response.json();
    return {
      results: data.results.map((item: any) => ({ ...item, media_type: 'movie' })),
      total_pages: data.total_pages,
    };
  },

  // Récupérer les séries populaires
  async getPopularTV(page = 1): Promise<{ results: Movie[]; total_pages: number }> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}&language=fr-FR`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des séries populaires');
    }

    const data = await response.json();
    return {
      results: data.results.map((item: any) => ({ ...item, media_type: 'tv' })),
      total_pages: data.total_pages,
    };
  },

  // Récupérer les tendances (films et séries)
  async getTrending(timeWindow: 'day' | 'week' = 'day', page = 1): Promise<{ results: Movie[]; total_pages: number }> {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/all/${timeWindow}?api_key=${TMDB_API_KEY}&page=${page}&language=fr-FR`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des tendances');
    }

    const data = await response.json();
    return {
      results: data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv'),
      total_pages: data.total_pages,
    };
  },

  // Récupérer les films en salle actuellement
  async getNowPlayingMovies(page = 1): Promise<{ results: Movie[]; total_pages: number }> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}&language=fr-FR&region=FR`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des films en salle');
    }

    const data = await response.json();
    return {
      results: data.results.map((item: any) => ({ ...item, media_type: 'movie' })),
      total_pages: data.total_pages,
    };
  },

  // Récupérer les films à venir
  async getUpcomingMovies(page = 1): Promise<{ results: Movie[]; total_pages: number }> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}&language=fr-FR&region=FR`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des films à venir');
    }

    const data = await response.json();
    return {
      results: data.results.map((item: any) => ({ ...item, media_type: 'movie' })),
      total_pages: data.total_pages,
    };
  },

  // Récupérer les films les mieux notés
  async getTopRatedMovies(page = 1): Promise<{ results: Movie[]; total_pages: number }> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}&language=fr-FR`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des films les mieux notés');
    }

    const data = await response.json();
    return {
      results: data.results.map((item: any) => ({ ...item, media_type: 'movie' })),
      total_pages: data.total_pages,
    };
  },

  // Récupérer les séries les mieux notées
  async getTopRatedTV(page = 1): Promise<{ results: Movie[]; total_pages: number }> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&page=${page}&language=fr-FR`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des séries les mieux notées');
    }

    const data = await response.json();
    return {
      results: data.results.map((item: any) => ({ ...item, media_type: 'tv' })),
      total_pages: data.total_pages,
    };
  },

  // Récupérer des recommandations basées sur un film
  async getRecommendations(movieId: number, mediaType: 'movie' | 'tv' = 'movie', page = 1): Promise<{ results: Movie[]; total_pages: number }> {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${movieId}/recommendations?api_key=${TMDB_API_KEY}&page=${page}&language=fr-FR`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des recommandations');
    }

    const data = await response.json();
    return {
      results: data.results.map((item: any) => ({ ...item, media_type: mediaType })),
      total_pages: data.total_pages,
    };
  },

  // Récupérer la liste des genres pour les films
  async getMovieGenres(): Promise<{ id: number; name: string }[]> {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=fr-FR`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des genres');
    }

    const data = await response.json();
    return data.genres;
  },

  // Récupérer la liste des genres pour les séries
  async getTVGenres(): Promise<{ id: number; name: string }[]> {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=fr-FR`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des genres');
    }

    const data = await response.json();
    return data.genres;
  },

  // Découvrir des films avec des filtres
  async discoverMovies(params: {
    page?: number;
    genre?: number;
    year?: number;
    sortBy?: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc';
    language?: string;
    region?: string;
  } = {}): Promise<{ results: Movie[]; total_pages: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('api_key', TMDB_API_KEY || '');
    queryParams.append('language', 'fr-FR');
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('sort_by', params.sortBy || 'popularity.desc');
    queryParams.append('include_adult', 'false');
    queryParams.append('vote_count.gte', '100');

    if (params.genre) {
      queryParams.append('with_genres', params.genre.toString());
    }

    if (params.year) {
      queryParams.append('primary_release_year', params.year.toString());
    }

    if (params.language) {
      queryParams.append('with_original_language', params.language);
    }

    if (params.region) {
      queryParams.append('region', params.region);
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la découverte de films');
    }

    const data = await response.json();
    return {
      results: data.results.map((item: any) => ({ ...item, media_type: 'movie' })),
      total_pages: data.total_pages,
    };
  },

  // Découvrir des séries avec des filtres
  async discoverTV(params: {
    page?: number;
    genre?: number;
    year?: number;
    sortBy?: 'popularity.desc' | 'vote_average.desc' | 'first_air_date.desc';
    language?: string;
  } = {}): Promise<{ results: Movie[]; total_pages: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('api_key', TMDB_API_KEY || '');
    queryParams.append('language', 'fr-FR');
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('sort_by', params.sortBy || 'popularity.desc');
    queryParams.append('include_adult', 'false');
    queryParams.append('vote_count.gte', '50');

    if (params.genre) {
      queryParams.append('with_genres', params.genre.toString());
    }

    if (params.year) {
      queryParams.append('first_air_date_year', params.year.toString());
    }

    if (params.language) {
      queryParams.append('with_original_language', params.language);
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la découverte de séries');
    }

    const data = await response.json();
    return {
      results: data.results.map((item: any) => ({ ...item, media_type: 'tv' })),
      total_pages: data.total_pages,
    };
  },

  // Construire l'URL de l'image
  getImageUrl(path: string | null, size: 'w200' | 'w300' | 'w500' | 'original' = 'w500'): string {
    if (!path) return '/placeholder.png';
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  },
};
