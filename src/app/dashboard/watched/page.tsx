'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Film, Eye, Star, Heart, Search, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 15; // 3 lignes de 5 films

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
    setCurrentPage(1); // Réinitialiser à la page 1 lors d'une recherche
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
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-3 md:mb-4 transition-colors text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Eye className="w-6 h-6 md:w-8 md:h-8 text-black" />
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-black">
                  Films Vus
                </h1>
                <p className="text-xs md:text-base text-gray-600 mt-0.5 md:mt-1">
                  {watchedMovies.length} film{watchedMovies.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4 md:mb-6">
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors text-sm md:text-base"
            />
          </div>
          {searchQuery && (
            <p className="text-xs md:text-sm text-gray-600 mt-2">
              {filteredMovies.length} résultat{filteredMovies.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Movies Grid */}
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
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredMovies
                .slice((currentPage - 1) * moviesPerPage, currentPage * moviesPerPage)
                .map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleMovieClick(movie)}
                    className="group"
                  >
                    <div className="aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden mb-2 border-2 border-transparent group-hover:border-black transition-colors relative">
                      {movie.poster_path ? (
                        <Image
                          src={tmdbService.getImageUrl(movie.poster_path, 'w300')}
                          alt={movie.title}
                          width={200}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Film className="w-12 h-12" />
                        </div>
                      )}
                      {/* Badge note */}
                      {movie.rating && (
                        <div className="absolute top-2 right-2 bg-black text-white rounded-lg px-2 py-1 text-xs font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" />
                          {movie.rating}
                        </div>
                      )}
                      {/* Badge favori */}
                      {movie.is_favorite && (
                        <div className="absolute top-2 left-2 bg-black text-white rounded-full w-7 h-7 flex items-center justify-center">
                          <Heart className="w-4 h-4 fill-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-black group-hover:underline line-clamp-2">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(movie.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </button>
                ))}
            </div>

            {/* Pagination */}
            {filteredMovies.length > moviesPerPage && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: Math.ceil(filteredMovies.length / moviesPerPage) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border-2 rounded-lg transition-all ${
                      currentPage === page
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 hover:border-black'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredMovies.length / moviesPerPage)))}
                  disabled={currentPage === Math.ceil(filteredMovies.length / moviesPerPage)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
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
