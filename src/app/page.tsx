'use client';

import Link from "next/link";
import { Film, Star, TrendingUp, Calendar } from "lucide-react";
import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import MovieModal from '@/components/MovieModal';
import Footer from '@/components/Footer';
import { Movie, tmdbService } from '@/services/tmdb';
import { moviesService } from '@/services/movies';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function Home() {
  const { user } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const trendingData = await tmdbService.getTrending('week', 1);
      setTrending(trendingData.results.slice(0, 12));

      const nowPlayingData = await tmdbService.getNowPlayingMovies(1);
      setNowPlaying(nowPlayingData.results.slice(0, 12));

      if (user) {
        await loadRecommendations();
      } else {
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
    try {
      const allMovies = await moviesService.getUserMovies();
      const favoriteMovies = allMovies.filter((m) => m.rating && m.rating >= 4).slice(0, 3);

      if (favoriteMovies.length > 0) {
        const allRecommendations: Movie[] = [];

        for (const movie of favoriteMovies) {
          const recs = await tmdbService.getRecommendations(
            movie.tmdb_id,
            movie.media_type as 'movie' | 'tv',
            1
          );
          allRecommendations.push(...recs.results.slice(0, 4));
        }

        const uniqueRecs = Array.from(
          new Map(allRecommendations.map(m => [m.id, m])).values()
        ).slice(0, 12);

        setRecommendations(uniqueRecs);
      } else {
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
    if (user) {
      loadRecommendations();
    }
  };

  const MovieCard = ({ movie }: { movie: Movie }) => (
    <button
      onClick={() => setSelectedMovie(movie)}
      className="group relative"
    >
      <div className="aspect-2/3 bg-[#E4DED2] rounded-lg overflow-hidden mb-2 border border-[#E4DED2] group-hover:border-[#F95C4B] group-hover:shadow-[0_4px_12px_rgba(13,13,13,0.08)] transition-all duration-200 group-hover:scale-[1.02]">
        {movie.poster_path ? (
          <Image
            src={tmdbService.getImageUrl(movie.poster_path, 'w300')}
            alt={movie.title || movie.name || ''}
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
      <h3 className="text-sm font-medium text-[#0D0D0D] line-clamp-2 px-0.5">
        {movie.title || movie.name}
      </h3>
      {movie.vote_average > 0 && (
        <div className="flex items-center gap-1 text-xs text-[#B8B0A0] mt-1 px-0.5">
          <Star className="w-3 h-3 fill-[#D4A843] text-[#D4A843]" />
          <span>{movie.vote_average.toFixed(1)}</span>
        </div>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F6F4F1]">
      {/* Hero Section with Search */}
      <section className="bg-[#E4DED2]">
        <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8 py-12 md:py-16 lg:py-24 pb-20 md:pb-24">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="bg-[#0D0D0D] p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_8px_24px_rgba(13,13,13,0.12)]">
                <Film className="w-12 h-12 md:w-16 md:h-16 text-[#F6F4F1]" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-[#0D0D0D] mb-3 md:mb-4">
              SeenIt
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-[#0D0D0D] mb-6 md:mb-8 max-w-3xl mx-auto px-4">
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
                  className="px-6 md:px-8 py-3 md:py-4 bg-[#F95C4B] text-[#F6F4F1] rounded-xl font-semibold hover:bg-[#C7392A] transition-all text-sm md:text-base"
                >
                  Commencer
                </Link>
                <Link
                  href="/dashboard"
                  className="px-6 md:px-8 py-3 md:py-4 bg-[#F6F4F1] hover:bg-[#EBE7E0] text-[#0D0D0D] rounded-xl font-semibold transition-all border border-[#B8B0A0] text-sm md:text-base"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F95C4B]"></div>
          </div>
        ) : (
          <>
            {/* Trending Section */}
            <section className="mb-12 md:mb-16">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-[#F95C4B]" />
                <h2 className="text-xl md:text-2xl font-bold text-[#0D0D0D]">Tendances</h2>
              </div>
              <div className="w-10 h-0.5 bg-[#F95C4B] mb-4 md:mb-6"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {trending.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>

            {/* Now Playing Section */}
            <section className="mb-12 md:mb-16">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <Calendar className="w-6 h-6 md:w-7 md:h-7 text-[#F95C4B]" />
                <h2 className="text-xl md:text-2xl font-bold text-[#0D0D0D]">En salle</h2>
              </div>
              <div className="w-10 h-0.5 bg-[#F95C4B] mb-4 md:mb-6"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {nowPlaying.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>

            {/* Recommendations Section */}
            <section className="mb-12 md:mb-16">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <Star className="w-6 h-6 md:w-7 md:h-7 text-[#D4A843]" />
                <h2 className="text-xl md:text-2xl font-bold text-[#0D0D0D]">
                  {user ? 'Pour vous' : 'Mieux notés'}
                </h2>
              </div>
              <div className="w-10 h-0.5 bg-[#F95C4B] mb-2 md:mb-3"></div>
              <p className="text-sm md:text-base text-[#B8B0A0] mb-4 md:mb-6">
                {user ? 'Basé sur vos favoris' : 'Les films les mieux notés'}
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
          <div className="bg-[#0D0D0D] rounded-2xl md:rounded-3xl p-6 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#F6F4F1] mb-3 md:mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-[#E4DED2] mb-6 md:mb-8 max-w-2xl mx-auto">
              Rejoignez SeenIt dès aujourd'hui
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-6 md:px-8 py-3 md:py-4 bg-[#F95C4B] text-[#F6F4F1] rounded-xl font-semibold hover:bg-[#C7392A] transition-all text-sm md:text-base"
            >
              Créer un compte
            </Link>
          </div>
        </section>
      )}

      <Footer />

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
