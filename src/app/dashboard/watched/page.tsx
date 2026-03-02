'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Film, Eye, Star, Heart, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import MovieModal from '@/components/MovieModal';
import { Movie, tmdbService } from '@/services/tmdb';
import { moviesService, UserMovie } from '@/services/movies';
import Image from 'next/image';

export default function WatchedMoviesPage() {
  const { user, loading, supabase } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [watchedMovies, setWatchedMovies] = useState<UserMovie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<UserMovie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMovies, setLoadingMovies] = useState(false);

  useEffect(() => {
    if (user && supabase) {
      loadData();
    }
  }, [user, supabase]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMovies(watchedMovies);
    } else {
      const filtered = watchedMovies.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMovies(filtered);
    }
  }, [searchQuery, watchedMovies]);

  const loadData = async () => {
    if (!supabase) return;

    setLoadingMovies(true);
    try {
      const watched = await moviesService.getWatchedMovies(supabase);
      setWatchedMovies(watched);
      setFilteredMovies(watched);
    } catch (error) {
      console.error('Error loading watched movies:', error);
    } finally {
      setLoadingMovies(false);
    }
  };

  const handleMovieUpdate = () => {
    loadData();
  };

  const handleMovieClick = async (userMovie: UserMovie) => {
    try {
      const details = userMovie.media_type === 'movie'
        ? await tmdbService.getMovieDetails(userMovie.tmdb_id)
        : await tmdbService.getTVDetails(userMovie.tmdb_id);
      
      setSelectedMovie(details as Movie);
    } catch (error) {
      console.error('Error loading movie details:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-6">
            Connectez-vous pour accéder à vos films
          </p>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-black" />
              <div>
                <h1 className="text-4xl font-bold text-black">
                  Mes Films Vus
                </h1>
                <p className="text-gray-600 mt-1">
                  {watchedMovies.length} film{watchedMovies.length > 1 ? 's' : ''} visionnés
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un film..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-2">
              {filteredMovies.length} résultat{filteredMovies.length > 1 ? 's' : ''} trouvé{filteredMovies.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Movies List */}
        {loadingMovies ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {searchQuery ? 'Aucun film trouvé' : 'Aucun film visionné pour le moment'}
            </p>
            {!searchQuery && (
              <>
                <p className="text-gray-400 text-sm mb-6">
                  Commencez à ajouter des films à votre collection
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                >
                  Découvrir des films
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMovies.map((movie) => (
              <button
                key={movie.id}
                onClick={() => handleMovieClick(movie)}
                className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-black transition-all group flex items-center gap-4"
              >
                {/* Poster */}
                <div className="flex-shrink-0 w-20 h-30 bg-gray-200 rounded-lg overflow-hidden relative">
                  {movie.poster_path ? (
                    <Image
                      src={tmdbService.getImageUrl(movie.poster_path, 'w200')}
                      alt={movie.title}
                      width={80}
                      height={120}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Film className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold text-black group-hover:underline">
                    {movie.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Vu le {new Date(movie.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  {movie.release_date && (
                    <p className="text-xs text-gray-400 mt-1">
                      Sortie : {new Date(movie.release_date).getFullYear()}
                    </p>
                  )}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-3">
                  {movie.rating && (
                    <div className="flex items-center gap-1 bg-black text-white rounded-lg px-3 py-2">
                      <Star className="w-4 h-4 fill-white" />
                      <span className="font-bold">{movie.rating}</span>
                    </div>
                  )}
                  {movie.is_favorite && (
                    <div className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center">
                      <Heart className="w-5 h-5 fill-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Movie Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onUpdate={handleMovieUpdate}
        />
      )}
    </div>
  );
}
