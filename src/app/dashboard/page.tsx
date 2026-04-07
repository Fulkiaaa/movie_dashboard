'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Film, Clock, Star, Eye, List, Heart, BarChart3, Trophy, Percent } from 'lucide-react';
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
  const { user, loading } = useAuth();
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

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoadingStats(true);
    try {
      const basicStats = await moviesService.getStats();
      const watchlist = await moviesService.getWatchlist();
      setWatchlistMovies(watchlist);
      const watched = await moviesService.getWatchedMovies();
      setWatchedMovies(watched);

      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const thisMonthCount = watched.filter(m =>
        new Date(m.created_at) >= oneMonthAgo
      ).length;

      const ratedMovies = watched.filter(m => m.rating !== null && m.rating > 0);
      const averageRating = ratedMovies.length > 0
        ? ratedMovies.reduce((sum, m) => sum + (m.rating || 0), 0) / ratedMovies.length
        : 0;

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
      <div className="min-h-screen bg-[#F6F4F1] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F95C4B]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F6F4F1] flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-[#B8B0A0] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#0D0D0D] mb-2">
            Connexion requise
          </h1>
          <p className="text-[#B8B0A0] mb-6">
            Connectez-vous pour accéder à votre dashboard
          </p>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-[#F95C4B] text-[#F6F4F1] rounded-lg hover:bg-[#C7392A] transition-all"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const MovieCard = ({ movie }: { movie: UserMovie }) => (
    <button
      onClick={() => handleMovieClick(movie)}
      className="group"
    >
      <div className="aspect-2/3 bg-[#E4DED2] rounded-lg overflow-hidden mb-2 border border-[#E4DED2] group-hover:border-[#F95C4B] group-hover:shadow-[0_4px_12px_rgba(13,13,13,0.08)] transition-all relative">
        {movie.poster_path ? (
          <Image
            src={tmdbService.getImageUrl(movie.poster_path, 'w300')}
            alt={movie.title}
            width={200}
            height={300}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#B8B0A0]">
            <Film className="w-12 h-12" />
          </div>
        )}
        {movie.rating && (
          <div className="absolute top-2 right-2 bg-[#D4A843] text-[#F6F4F1] rounded-lg px-2 py-1 text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-[#F6F4F1]" />
            {movie.rating}
          </div>
        )}
        {movie.is_favorite && (
          <div className="absolute top-2 left-2 bg-[#F95C4B] text-[#F6F4F1] rounded-full w-7 h-7 flex items-center justify-center">
            <Heart className="w-4 h-4 fill-[#F6F4F1]" />
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-[#0D0D0D] group-hover:underline line-clamp-2">
        {movie.title}
      </h3>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F6F4F1]">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-[#0D0D0D] mb-1 md:mb-2">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-[#B8B0A0]">
            Analyse complète de votre activité cinéma
          </p>
        </div>

        {/* Films Vus */}
        <div className="bg-[#F6F4F1] border border-[#E4DED2] rounded-xl p-4 md:p-6 mb-6 md:mb-8 shadow-[0_1px_3px_rgba(13,13,13,0.06)]">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <Eye className="w-5 h-5 md:w-6 md:h-6 text-[#F95C4B]" />
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-[#0D0D0D]">Mes Films Vus</h2>
                <div className="w-8 h-0.5 bg-[#F95C4B] mt-1"></div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs md:text-sm font-semibold text-[#0D0D0D]">
                {watchedMovies.length} film{watchedMovies.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-[#B8B0A0] hidden sm:block">
                {loadingStats ? '...' : formatTime(stats.totalMinutes)} cumulés
              </p>
            </div>
          </div>

          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F95C4B]"></div>
            </div>
          ) : watchedMovies.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-[#B8B0A0] mx-auto mb-4" />
              <p className="text-[#B8B0A0] mb-2">Aucun film visionné pour le moment</p>
              <p className="text-[#B8B0A0] text-sm mb-6">
                Commencez à ajouter des films à votre collection
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-[#F95C4B] text-[#F6F4F1] rounded-lg hover:bg-[#C7392A] transition-all"
              >
                Découvrir des films
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {watchedMovies.slice(0, 5).map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
              {watchedMovies.length > 5 && (
                <div className="mt-4 md:mt-6 text-center">
                  <Link
                    href="/dashboard/watched"
                    className="inline-block px-4 md:px-6 py-2 md:py-3 bg-[#F95C4B] text-[#F6F4F1] rounded-lg hover:bg-[#C7392A] transition-all text-sm md:text-base"
                  >
                    Voir tous les films ({watchedMovies.length})
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Taux de notation */}
          <div className="bg-[#F6F4F1] border border-[#E4DED2] rounded-xl p-4 md:p-6 shadow-[0_1px_3px_rgba(13,13,13,0.06)]">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <Percent className="w-5 h-5 md:w-6 md:h-6 text-[#F95C4B]" />
              <h3 className="text-lg md:text-xl font-bold text-[#0D0D0D]">Taux de Notation</h3>
            </div>
            <div className="flex items-end gap-3 md:gap-4">
              <p className="text-3xl md:text-4xl font-bold text-[#0D0D0D]">
                {loadingStats ? '...' : stats.totalWatched > 0
                  ? Math.round((stats.ratedMoviesCount / stats.totalWatched) * 100)
                  : 0}%
              </p>
              <p className="text-sm md:text-base text-[#B8B0A0] mb-1 md:mb-2">
                {stats.ratedMoviesCount} / {stats.totalWatched}
              </p>
            </div>
            <div className="mt-3 md:mt-4 bg-[#E4DED2] rounded-full h-2 md:h-3 overflow-hidden">
              <div
                className="bg-[#F95C4B] h-full transition-all duration-500"
                style={{
                  width: `${stats.totalWatched > 0
                    ? (stats.ratedMoviesCount / stats.totalWatched) * 100
                    : 0}%`
                }}
              ></div>
            </div>
          </div>

          {/* Activité */}
          <div className="bg-[#F6F4F1] border border-[#E4DED2] rounded-xl p-4 md:p-6 shadow-[0_1px_3px_rgba(13,13,13,0.06)]">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-[#F95C4B]" />
              <h3 className="text-lg md:text-xl font-bold text-[#0D0D0D]">Activité Récente</h3>
            </div>
            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm md:text-base text-[#B8B0A0]">7 derniers jours</span>
                <span className="text-lg md:text-xl font-bold text-[#0D0D0D]">{stats.thisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm md:text-base text-[#B8B0A0]">30 derniers jours</span>
                <span className="text-lg md:text-xl font-bold text-[#0D0D0D]">{stats.thisMonth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm md:text-base text-[#B8B0A0]">Temps total</span>
                <span className="text-lg md:text-xl font-bold text-[#0D0D0D]">
                  {loadingStats ? '...' : formatTime(stats.totalMinutes)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Watchlist */}
        <div className="bg-[#F6F4F1] border border-[#E4DED2] rounded-xl p-4 md:p-6 mb-6 md:mb-8 shadow-[0_1px_3px_rgba(13,13,13,0.06)]">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <List className="w-5 h-5 md:w-6 md:h-6 text-[#F95C4B]" />
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-[#0D0D0D]">Ma Watchlist</h2>
                <div className="w-8 h-0.5 bg-[#F95C4B] mt-1"></div>
              </div>
            </div>
            <span className="text-xs md:text-sm text-[#B8B0A0]">
              {watchlistMovies.length} film{watchlistMovies.length > 1 ? 's' : ''}
            </span>
          </div>

          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F95C4B]"></div>
            </div>
          ) : watchlistMovies.length === 0 ? (
            <div className="text-center py-12">
              <List className="w-16 h-16 text-[#B8B0A0] mx-auto mb-4" />
              <p className="text-[#B8B0A0]">Votre watchlist est vide</p>
              <Link
                href="/"
                className="inline-block mt-4 px-6 py-3 bg-[#F95C4B] text-[#F6F4F1] rounded-lg hover:bg-[#C7392A] transition-all"
              >
                Découvrir des films
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {watchlistMovies.slice(0, 5).map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleMovieClick(movie)}
                    className="group"
                  >
                    <div className="aspect-2/3 bg-[#E4DED2] rounded-lg overflow-hidden mb-2 border border-[#E4DED2] group-hover:border-[#F95C4B] group-hover:shadow-[0_4px_12px_rgba(13,13,13,0.08)] transition-all">
                      {movie.poster_path ? (
                        <Image
                          src={tmdbService.getImageUrl(movie.poster_path, 'w300')}
                          alt={movie.title}
                          width={200}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#B8B0A0]">
                          <Film className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-[#0D0D0D] group-hover:underline line-clamp-2">
                      {movie.title}
                    </h3>
                  </button>
                ))}
              </div>
              {watchlistMovies.length > 5 && (
                <div className="mt-4 md:mt-6 text-center">
                  <Link
                    href="/dashboard/watchlist"
                    className="inline-block px-4 md:px-6 py-2 md:py-3 bg-[#F95C4B] text-[#F6F4F1] rounded-lg hover:bg-[#C7392A] transition-all text-sm md:text-base"
                  >
                    Voir toute la watchlist ({watchlistMovies.length})
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Meilleurs Films */}
        <div className="bg-[#F6F4F1] border border-[#E4DED2] rounded-xl p-6 shadow-[0_1px_3px_rgba(13,13,13,0.06)]">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 md:w-7 md:h-7 text-[#D4A843]" />
            <h2 className="text-xl md:text-2xl font-bold text-[#0D0D0D]">Mes Meilleurs Films</h2>
          </div>
          <div className="w-8 h-0.5 bg-[#F95C4B] mb-6"></div>

          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F95C4B]"></div>
            </div>
          ) : watchedMovies.filter(m => m.rating === 5).length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-[#B8B0A0] mx-auto mb-4" />
              <p className="text-[#B8B0A0]">Aucun film noté 5 étoiles pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {watchedMovies
                .filter(m => m.rating === 5)
                .slice(0, 6)
                .map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleMovieClick(movie)}
                    className="group"
                  >
                    <div className="aspect-2/3 bg-[#E4DED2] rounded-lg overflow-hidden mb-2 border border-[#E4DED2] group-hover:border-[#D4A843] group-hover:shadow-[0_4px_12px_rgba(13,13,13,0.08)] transition-all relative">
                      {movie.poster_path ? (
                        <Image
                          src={tmdbService.getImageUrl(movie.poster_path, 'w300')}
                          alt={movie.title}
                          width={200}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#B8B0A0]">
                          <Film className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-[#D4A843] text-[#F6F4F1] rounded-full w-8 h-8 flex items-center justify-center">
                        <Star className="w-4 h-4 fill-[#F6F4F1]" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-[#0D0D0D] group-hover:underline line-clamp-2">
                      {movie.title}
                    </h3>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

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
