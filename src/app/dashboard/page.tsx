'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Film, TrendingUp, Clock, Star, Eye, List } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import MovieModal from '@/components/MovieModal';
import { Movie, tmdbService } from '@/services/tmdb';
import { moviesService } from '@/services/movies';
import Image from 'next/image';

export default function DashboardPage() {
  const { user, loading, supabase } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [stats, setStats] = useState({
    watched: 0,
    favorites: 0,
    thisWeek: 0,
    watchlist: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (user && supabase) {
      loadData();
    }
  }, [user, supabase]);

  const loadData = async () => {
    if (!supabase) return;

    setLoadingStats(true);
    try {
      // Charger les stats
      const userStats = await moviesService.getStats(supabase);
      setStats(userStats);

      // Charger des films populaires
      const popular = await tmdbService.getPopularMovies(1);
      setPopularMovies(popular.results.slice(0, 6));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleMovieUpdate = () => {
    loadData();
  };

  const statsData = [
    { label: 'Films vus', value: stats.watched, icon: Eye },
    { label: 'Favoris', value: stats.favorites, icon: Star },
    { label: 'Cette semaine', value: stats.thisWeek, icon: Clock },
    { label: 'Watchlist', value: stats.watchlist, icon: List }
  ];

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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Recherchez et ajoutez des films à votre collection
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <SearchBar onSelectMovie={setSelectedMovie} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-black transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-black p-2 mb-4">
                <stat.icon className="w-full h-full text-white" />
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-black">
                {loadingStats ? '...' : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Popular Movies */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">Films populaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularMovies.map((movie) => (
              <button
                key={movie.id}
                onClick={() => setSelectedMovie(movie)}
                className="group"
              >
                <div className="aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden mb-2 border-2 border-transparent group-hover:border-black transition-colors">
                  {movie.poster_path ? (
                    <Image
                      src={tmdbService.getImageUrl(movie.poster_path, 'w300')}
                      alt={movie.title || movie.name || ''}
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
                  {movie.title || movie.name}
                </h3>
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                    <Star className="w-3 h-3 fill-black text-black" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-black mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/swipe"
              className="flex items-center gap-4 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-black font-semibold">
                  Découvrir des films
                </h3>
                <p className="text-gray-600 text-sm">
                  Swipez pour trouver votre prochain film
                </p>
              </div>
            </Link>
            <Link
              href="/test"
              className="flex items-center gap-4 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-black font-semibold">
                  Tester les connexions
                </h3>
                <p className="text-gray-600 text-sm">
                  Vérifier TMDB et Supabase
                </p>
              </div>
            </Link>
          </div>
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
