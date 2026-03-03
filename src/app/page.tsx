'use client';

import Link from "next/link";
import { Film, Star, TrendingUp, Calendar } from "lucide-react";
import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import MovieModal from '@/components/MovieModal';
import { Movie, tmdbService } from '@/services/tmdb';
import { moviesService } from '@/services/movies';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function Home() {
  const { user, supabase } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user, supabase]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les tendances
      const trendingData = await tmdbService.getTrending('week', 1);
      setTrending(trendingData.results.slice(0, 12));

      // Charger les films en salle
      const nowPlayingData = await tmdbService.getNowPlayingMovies(1);
      setNowPlaying(nowPlayingData.results.slice(0, 12));

      // Charger les recommandations basées sur le profil
      if (user && supabase) {
        await loadRecommendations();
      } else {
        // Si pas connecté, afficher les films les mieux notés
        const topRated = await tmdbService.getTopRatedMovies(1);
        setRecommendations(topRated.results.slice(0, 12));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    if (!supabase) return;

    try {
      // Récupérer les films favoris de l'utilisateur (note >= 4)
      const { data: favoriteMovies } = await supabase
        .from('user_movies')
        .select('tmdb_id, media_type')
        .gte('rating', 4)
        .limit(3);

      if (favoriteMovies && favoriteMovies.length > 0) {
        // Obtenir des recommandations basées sur les films favoris
        const allRecommendations: Movie[] = [];
        
        for (const movie of favoriteMovies) {
          const recs = await tmdbService.getRecommendations(
            movie.tmdb_id,
            movie.media_type as 'movie' | 'tv',
            1
          );
          allRecommendations.push(...recs.results.slice(0, 4));
        }

        // Dédupliquer et limiter à 12 films
        const uniqueRecs = Array.from(
          new Map(allRecommendations.map(m => [m.id, m])).values()
        ).slice(0, 12);

        setRecommendations(uniqueRecs);
      } else {
        // Pas de favoris, afficher les films les mieux notés
        const topRated = await tmdbService.getTopRatedMovies(1);
        setRecommendations(topRated.results.slice(0, 12));
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      const topRated = await tmdbService.getTopRatedMovies(1);
      setRecommendations(topRated.results.slice(0, 12));
    }
  };

  const handleMovieUpdate = () => {
    if (user && supabase) {
      loadRecommendations();
    }
  };

  const MovieCard = ({ movie }: { movie: Movie }) => (
    <button
      onClick={() => setSelectedMovie(movie)}
      className="group relative"
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
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search */}
      <section className="relative overflow-hidden bg-gray-50">
        <div className="relative max-w-7xl mx-auto px-3 md:px-4 lg:px-8 py-12 md:py-16 lg:py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="bg-black p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-xl">
                <Film className="w-12 h-12 md:w-16 md:h-16 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-black mb-3 md:mb-4">
              SeenIt
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-gray-700 mb-6 md:mb-8 max-w-3xl mx-auto px-4">
              Découvrez et organisez votre passion cinéma
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar onSelectMovie={setSelectedMovie} />
            </div>

            {/* CTA Buttons */}
            {!user && (
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
                <Link
                  href="/auth/signup"
                  className="px-6 md:px-8 py-3 md:py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all text-sm md:text-base"
                >
                  Commencer
                </Link>
                <Link
                  href="/dashboard"
                  className="px-6 md:px-8 py-3 md:py-4 bg-white hover:bg-gray-100 text-black rounded-xl font-semibold transition-all border-2 border-black text-sm md:text-base"
                >
                  Explorer
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8 py-8 md:py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <>
            {/* Trending Section */}
            <section className="mb-12 md:mb-16">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-black" />
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-black">Tendances</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {trending.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>

            {/* Now Playing / New Releases Section */}
            <section className="mb-12 md:mb-16">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <Calendar className="w-6 h-6 md:w-8 md:h-8 text-black" />
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-black">En salle</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {nowPlaying.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>

            {/* Recommendations Section */}
            <section className="mb-12 md:mb-16">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <Star className="w-6 h-6 md:w-8 md:h-8 text-black" />
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-black">
                  {user ? 'Pour vous' : 'Mieux notés'}
                </h2>
              </div>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                {user 
                  ? 'Basé sur vos favoris'
                  : 'Les films les mieux notés'
                }
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {recommendations.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* CTA Section */}
      {!user && (
        <section className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8 py-12 md:py-16">
          <div className="bg-black rounded-2xl md:rounded-3xl p-6 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto">
              Rejoignez SeenIt dès aujourd'hui
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-6 md:px-8 py-3 md:py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-all text-sm md:text-base"
            >
              Créer un compte
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-black p-2 rounded-lg">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-600">© 2026 SeenIt</span>
            </div>
            <div className="flex gap-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-black transition-colors">
                Dashboard
              </Link>
              <Link href="/swipe" className="text-gray-600 hover:text-black transition-colors">
                Swipe
              </Link>
            </div>
          </div>
        </div>
      </footer>

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
