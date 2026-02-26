'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Film, TrendingUp, Clock, Star, Eye, List, Heart, Calendar, BarChart3, Trophy, Percent } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import MovieModal from '@/components/MovieModal';
import { Movie, tmdbService } from '@/services/tmdb';
import { moviesService, UserMovie } from '@/services/movies';
import Image from 'next/image';

interface AdvancedStats {
  totalWatched: number;
  totalWatchlist: number;
  totalFavorites: number;
  thisWeek: number;
  thisMonth: number;
  averageRating: number;
  totalMinutes: number;
  ratedMoviesCount: number;
}

export default function DashboardPage() {
  const { user, loading, supabase } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [watchlistMovies, setWatchlistMovies] = useState<UserMovie[]>([]);
  const [watchedMovies, setWatchedMovies] = useState<UserMovie[]>([]);
  const [stats, setStats] = useState<AdvancedStats>({
    totalWatched: 0,
    totalWatchlist: 0,
    totalFavorites: 0,
    thisWeek: 0,
    thisMonth: 0,
    averageRating: 0,
    totalMinutes: 0,
    ratedMoviesCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [showAllWatched, setShowAllWatched] = useState(false);
  const [showAllWatchlist, setShowAllWatchlist] = useState(false);

  useEffect(() => {
    if (user && supabase) {
      loadData();
    }
  }, [user, supabase]);

  const loadData = async () => {
    if (!supabase) return;

    setLoadingStats(true);
    try {
      // Charger les stats de base
      const basicStats = await moviesService.getStats(supabase);
      
      // Charger la watchlist
      const watchlist = await moviesService.getWatchlist(supabase);
      setWatchlistMovies(watchlist);

      // Charger les films vus
      const watched = await moviesService.getWatchedMovies(supabase);
      setWatchedMovies(watched);

      // Calculer les statistiques avancées
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Films vus ce mois-ci
      const thisMonthCount = watched.filter(m => 
        new Date(m.created_at) >= oneMonthAgo
      ).length;

      // Moyenne des notes
      const ratedMovies = watched.filter(m => m.rating !== null && m.rating > 0);
      const averageRating = ratedMovies.length > 0
        ? ratedMovies.reduce((sum, m) => sum + (m.rating || 0), 0) / ratedMovies.length
        : 0;

      // Temps total de visionnage (estimation : on va charger les détails)
      let totalMinutes = 0;
      for (const movie of watched) {
        try {
          if (movie.media_type === 'movie') {
            const details = await tmdbService.getMovieDetails(movie.tmdb_id);
            if (details.runtime) {
              totalMinutes += details.runtime;
            }
          }
        } catch (error) {
          console.error('Error loading movie runtime:', error);
        }
      }

      setStats({
        totalWatched: basicStats.watched,
        totalWatchlist: basicStats.watchlist,
        totalFavorites: basicStats.favorites,
        thisWeek: basicStats.thisWeek,
        thisMonth: thisMonthCount,
        averageRating,
        totalMinutes,
        ratedMoviesCount: ratedMovies.length,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingStats(false);
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

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}j ${remainingHours}h`;
    }
    return `${hours}h ${mins}m`;
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
            Connectez-vous pour accéder à votre dashboard
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
          <h1 className="text-4xl font-bold text-black mb-2">
            Dashboard Statistiques
          </h1>
          <p className="text-gray-600">
            Analyse complète de votre activité cinéma
          </p>
        </div>

        {/* Mes Films Vus - Liste complète */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Eye className="w-7 h-7 text-black" />
              <h2 className="text-2xl font-bold text-black">Mes Films Vus</h2>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-black">
                {watchedMovies.length} film{watchedMovies.length > 1 ? 's' : ''} visionnés
              </p>
              <p className="text-xs text-gray-500">
                {loadingStats ? '...' : formatTime(stats.totalMinutes)} cumulés
              </p>
            </div>
          </div>

          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : watchedMovies.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Aucun film visionné pour le moment</p>
              <p className="text-gray-400 text-sm mb-6">
                Commencez à ajouter des films à votre collection
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
              >
                Découvrir des films
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {(showAllWatched ? watchedMovies : watchedMovies.slice(0, 6)).map((movie) => (
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
              {watchedMovies.length > 6 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAllWatched(!showAllWatched)}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                  >
                    {showAllWatched ? 'Voir moins' : `Voir plus (${watchedMovies.length - 6} films)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Taux de notation */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Percent className="w-6 h-6 text-black" />
              <h3 className="text-xl font-bold text-black">Taux de Notation</h3>
            </div>
            <div className="flex items-end gap-4">
              <p className="text-4xl font-bold text-black">
                {loadingStats ? '...' : stats.totalWatched > 0 
                  ? Math.round((stats.ratedMoviesCount / stats.totalWatched) * 100) 
                  : 0}%
              </p>
              <p className="text-gray-600 mb-2">
                {stats.ratedMoviesCount} / {stats.totalWatched} films notés
              </p>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-black h-full transition-all duration-500"
                style={{ 
                  width: `${stats.totalWatched > 0 
                    ? (stats.ratedMoviesCount / stats.totalWatched) * 100 
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Activité */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-black" />
              <h3 className="text-xl font-bold text-black">Activité Récente</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">7 derniers jours</span>
                <span className="text-xl font-bold text-black">{stats.thisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">30 derniers jours</span>
                <span className="text-xl font-bold text-black">{stats.thisMonth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Moyenne par semaine</span>
                <span className="text-xl font-bold text-black">
                  {stats.totalWatched > 0 ? Math.round(stats.thisWeek / 1) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ma Watchlist */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <List className="w-7 h-7 text-black" />
              <h2 className="text-2xl font-bold text-black">Ma Watchlist</h2>
            </div>
            <span className="text-sm text-gray-600">
              {watchlistMovies.length} film{watchlistMovies.length > 1 ? 's' : ''} à voir
            </span>
          </div>

          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : watchlistMovies.length === 0 ? (
            <div className="text-center py-12">
              <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Votre watchlist est vide</p>
              <Link
                href="/"
                className="inline-block mt-4 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
              >
                Découvrir des films
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {(showAllWatchlist ? watchlistMovies : watchlistMovies.slice(0, 6)).map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleMovieClick(movie)}
                    className="group"
                  >
                    <div className="aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden mb-2 border-2 border-transparent group-hover:border-black transition-colors">
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
                    </div>
                    <h3 className="text-sm font-semibold text-black group-hover:underline line-clamp-2">
                      {movie.title}
                    </h3>
                  </button>
                ))}
              </div>
              {watchlistMovies.length > 6 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAllWatchlist(!showAllWatchlist)}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                  >
                    {showAllWatchlist ? 'Voir moins' : `Voir plus (${watchlistMovies.length - 6} films)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Films les mieux notés */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-7 h-7 text-black" />
            <h2 className="text-2xl font-bold text-black">Mes Meilleurs Films</h2>
          </div>

          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : watchedMovies.filter(m => m.rating === 5).length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun film noté 5 étoiles pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {watchedMovies
                .filter(m => m.rating === 5)
                .slice(0, 5)
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
                      <div className="absolute top-2 right-2 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center">
                        <Star className="w-4 h-4 fill-white" />
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-black group-hover:underline line-clamp-2">
                      {movie.title}
                    </h3>
                  </button>
                ))}
            </div>
          )}
        </div>
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
