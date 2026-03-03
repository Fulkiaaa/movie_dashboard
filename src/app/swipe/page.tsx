'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Heart, X, Bookmark, Star, TrendingUp, Calendar, Film, Globe, Languages, Play } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { tmdbService, Movie } from '@/services/tmdb';
import { moviesService } from '@/services/movies';
import Image from 'next/image';

type SwipeMode = 'selection' | 'swipe';
type FilterType = 'popular' | 'topRated' | 'year' | 'genre' | 'trending';

interface SwipeFilter {
  type: FilterType;
  genre?: number;
  year?: number;
}

export default function SwipePage() {
  const { user, loading, supabase } = useAuth();
  const [mode, setMode] = useState<SwipeMode>('selection');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [excludedMovieIds, setExcludedMovieIds] = useState<Set<number>>(new Set());
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [showYearMenu, setShowYearMenu] = useState(false);
  const [showGenreMenu, setShowGenreMenu] = useState(false);

  const currentMovie = movies[currentIndex];

  // Load genres on mount
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const [movieGenres, tvGenres] = await Promise.all([
          tmdbService.getMovieGenres(),
          tmdbService.getTVGenres(),
        ]);
        // Combiner et dédupliquer les genres
        const allGenres = [...movieGenres, ...tvGenres];
        const uniqueGenres = Array.from(
          new Map(allGenres.map(g => [g.id, g])).values()
        );
        setGenres(uniqueGenres.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Error loading genres:', error);
      }
    };

    loadGenres();
  }, []);

  // Load movies based on selected filter
  const loadMoviesWithFilter = async (filter: SwipeFilter) => {
    if (!user || !supabase) return;

    try {
      setLoadingMovies(true);
      setMode('swipe');
      
      // Récupérer les films de l'utilisateur (vus et watchlist) pour les exclure
      const [userMovies, skippedIds] = await Promise.all([
        moviesService.getUserMovies(supabase),
        moviesService.getSkippedMovieIds(supabase),
      ]);

      const excludedIds = new Set([
        ...userMovies.map(m => m.tmdb_id),
        ...skippedIds,
      ]);
      setExcludedMovieIds(excludedIds);

      let allMovies: Movie[] = [];

      // Charger différentes catégories selon le filtre
      switch (filter.type) {
        case 'popular':
          const [popularMovies, popularTV] = await Promise.all([
            tmdbService.getPopularMovies(1),
            tmdbService.getPopularTV(1),
          ]);
          allMovies = [
            ...popularMovies.results.map(m => ({ ...m, media_type: 'movie' as const })),
            ...popularTV.results.map(m => ({ ...m, media_type: 'tv' as const})),
          ];
          break;

        case 'topRated':
          const [topRatedMovies, topRatedTV] = await Promise.all([
            tmdbService.getTopRatedMovies(1),
            tmdbService.getTopRatedTV(1),
          ]);
          allMovies = [
            ...topRatedMovies.results.map(m => ({ ...m, media_type: 'movie' as const })),
            ...topRatedTV.results.map(m => ({ ...m, media_type: 'tv' as const })),
          ];
          break;

        case 'trending':
          const trending = await tmdbService.getTrending('week', 1);
          allMovies = trending.results;
          break;

        case 'year':
          if (filter.year) {
            const [moviesByYear, tvByYear] = await Promise.all([
              tmdbService.discoverMovies({ year: filter.year, page: 1 }),
              tmdbService.discoverTV({ year: filter.year, page: 1 }),
            ]);
            allMovies = [
              ...moviesByYear.results,
              ...tvByYear.results,
            ];
          }
          break;

        case 'genre':
          if (filter.genre) {
            const [moviesByGenre, tvByGenre] = await Promise.all([
              tmdbService.discoverMovies({ genre: filter.genre, page: 1 }),
              tmdbService.discoverTV({ genre: filter.genre, page: 1 }),
            ]);
            allMovies = [
              ...moviesByGenre.results,
              ...tvByGenre.results,
            ];
          }
          break;
      }

      // Filtrer les doublons et les films déjà vus/watchlist/skippés
      const uniqueMovies = Array.from(
        new Map(allMovies.map(m => [m.id, m])).values()
      ).filter(m => !excludedIds.has(m.id));

      // Mélanger les films
      const shuffled = uniqueMovies.sort(() => Math.random() - 0.5);
      
      setMovies(shuffled);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoadingMovies(false);
    }
  };

  // Load more movies when running low
  const loadMoreMovies = async () => {
    if (!supabase) return;

    try {
      const nextPage = Math.floor(movies.length / 20) + 2;
      const [popularMovies, topRatedMovies, popularTV, topRatedTV, trending] = await Promise.all([
        tmdbService.getPopularMovies(nextPage),
        tmdbService.getTopRatedMovies(nextPage),
        tmdbService.getPopularTV(nextPage),
        tmdbService.getTopRatedTV(nextPage),
        tmdbService.getTrending('week', nextPage),
      ]);

      const newMovies = [
        ...popularMovies.results.map(m => ({ ...m, media_type: 'movie' as const })),
        ...topRatedMovies.results.map(m => ({ ...m, media_type: 'movie' as const })),
        ...popularTV.results.map(m => ({ ...m, media_type: 'tv' as const })),
        ...topRatedTV.results.map(m => ({ ...m, media_type: 'tv' as const })),
        ...trending.results,
      ];

      const uniqueNewMovies = Array.from(
        new Map(newMovies.map(m => [m.id, m])).values()
      ).filter(m => !excludedMovieIds.has(m.id));

      const shuffled = uniqueNewMovies.sort(() => Math.random() - 0.5);
      setMovies(prev => [...prev, ...shuffled]);
    } catch (error) {
      console.error('Error loading more movies:', error);
    }
  };

  const handleDislike = async () => {
    if (!supabase || !currentMovie) return;

    try {
      setSwipeDirection('left');
      
      // Ajouter à la liste des films skippés
      await moviesService.addSkippedMovie(
        supabase,
        currentMovie.id,
        currentMovie.media_type || 'movie'
      );

      setExcludedMovieIds(prev => new Set([...prev, currentMovie.id]));
      
      setTimeout(() => {
        moveToNext();
        setSwipeDirection(null);
      }, 300);
    } catch (error) {
      console.error('Error skipping movie:', error);
      setSwipeDirection(null);
    }
  };

  const handleLike = () => {
    setShowRating(true);
  };

  const handleWatchlist = async () => {
    if (!supabase || !currentMovie) return;

    try {
      setSwipeDirection('up');
      
      await moviesService.addMovie(supabase, {
        tmdb_id: currentMovie.id,
        media_type: currentMovie.media_type || 'movie',
        title: currentMovie.title || currentMovie.name || '',
        poster_path: currentMovie.poster_path,
        release_date: currentMovie.release_date || currentMovie.first_air_date || null,
        status: 'watchlist',
      });

      setExcludedMovieIds(prev => new Set([...prev, currentMovie.id]));
      
      setTimeout(() => {
        moveToNext();
        setSwipeDirection(null);
        setShowRating(false);
        setSelectedRating(null);
      }, 300);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      setSwipeDirection(null);
    }
  };

  const handleAddWatched = async (withRating: boolean = false) => {
    if (!supabase || !currentMovie) return;

    try {
      await moviesService.addMovie(supabase, {
        tmdb_id: currentMovie.id,
        media_type: currentMovie.media_type || 'movie',
        title: currentMovie.title || currentMovie.name || '',
        poster_path: currentMovie.poster_path,
        release_date: currentMovie.release_date || currentMovie.first_air_date || null,
        status: 'watched',
        rating: withRating && selectedRating ? selectedRating : null,
      });

      setExcludedMovieIds(prev => new Set([...prev, currentMovie.id]));
      setSwipeDirection('right');
      
      setTimeout(() => {
        moveToNext();
        setSwipeDirection(null);
        setShowRating(false);
        setSelectedRating(null);
      }, 300);
    } catch (error) {
      console.error('Error adding movie:', error);
    }
  };

  const moveToNext = () => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    
    // Load more movies if running low
    if (nextIndex >= movies.length - 5) {
      loadMoreMovies();
    }
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    // Valider automatiquement après avoir sélectionné une note
    setTimeout(() => {
      handleAddWatched(true);
    }, 400);
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
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-6">
            Connectez-vous pour découvrir des films
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

  // Selection Screen
  if (mode === 'selection') {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    return (
      <div className="min-h-screen bg-gray-50 py-6 md:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-3">
              Que voulez-vous découvrir ?
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Choisissez une catégorie pour commencer à swiper
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
            {/* Popular */}
            <button
              onClick={() => loadMoviesWithFilter({ type: 'popular' })}
              className="group p-4 md:p-8 bg-white rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500"
            >
              <TrendingUp className="w-10 h-10 md:w-12 md:h-12 text-blue-500 mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-black mb-1 md:mb-2">Les plus populaires</h3>
              <p className="text-gray-600 text-xs md:text-sm">Films et séries les plus regardés</p>
            </button>

            {/* Top Rated */}
            <button
              onClick={() => loadMoviesWithFilter({ type: 'topRated' })}
              className="group p-4 md:p-8 bg-white rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-500"
            >
              <Star className="w-10 h-10 md:w-12 md:h-12 text-yellow-500 mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-black mb-1 md:mb-2">Les mieux notés</h3>
              <p className="text-gray-600 text-xs md:text-sm">Les meilleurs selon les critiques</p>
            </button>

            {/* Trending */}
            <button
              onClick={() => loadMoviesWithFilter({ type: 'trending' })}
              className="group p-4 md:p-8 bg-white rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500"
            >
              <Play className="w-10 h-10 md:w-12 md:h-12 text-purple-500 mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-black mb-1 md:mb-2">Tendances</h3>
              <p className="text-gray-600 text-xs md:text-sm">Ce qui cartonne en ce moment</p>
            </button>

            {/* By Year */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowYearMenu(!showYearMenu);
                  if (showGenreMenu) setShowGenreMenu(false);
                }}
                className="group w-full p-4 md:p-8 bg-white rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-green-500"
              >
                <Calendar className="w-10 h-10 md:w-12 md:h-12 text-green-500 mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-black mb-1 md:mb-2">Par année</h3>
                <p className="text-gray-600 text-xs md:text-sm">Films et séries par période</p>
              </button>

              {showYearMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowYearMenu(false)}
                  />
                  {/* Menu */}
                  <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl p-3 md:p-4 grid grid-cols-2 gap-2 z-20 max-h-80 overflow-y-auto border border-gray-200">
                  {years.map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        loadMoviesWithFilter({ type: 'year', year });
                        setShowYearMenu(false);
                      }}
                      className="px-3 md:px-4 py-2 md:py-2.5 hover:bg-green-50 rounded-lg text-black font-semibold transition-colors text-sm md:text-base"
                    >
                      {year}
                    </button>
                  ))}
                </div>
                </>
              )}
            </div>

            {/* By Genre */}
            <div className="relative md:col-span-2">
              <button
                onClick={() => {
                  setShowGenreMenu(!showGenreMenu);
                  if (showYearMenu) setShowYearMenu(false);
                }}
                className="group w-full p-4 md:p-8 bg-white rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-pink-500"
              >
                <Film className="w-10 h-10 md:w-12 md:h-12 text-pink-500 mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-black mb-1 md:mb-2">Par genre</h3>
                <p className="text-gray-600 text-xs md:text-sm">Action, Comédie, Drame...</p>
              </button>

              {showGenreMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowGenreMenu(false)}
                  />
                  {/* Menu */}
                  <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl p-3 md:p-4 grid grid-cols-2 md:grid-cols-3 gap-2 z-20 max-h-80 md:max-h-96 overflow-y-auto border border-gray-200">
                  {genres.map(genre => (
                    <button
                      key={genre.id}
                      onClick={() => {
                        loadMoviesWithFilter({ type: 'genre', genre: genre.id });
                        setShowGenreMenu(false);
                      }}
                      className="px-3 md:px-4 py-2 hover:bg-pink-50 rounded-lg text-black font-semibold transition-colors text-left text-sm md:text-base"
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
                </>
              )}
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-black transition-colors"
            >
              Retour au dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Swipe Screen
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 md:p-4">
      <div className="w-full max-w-5xl">
        {/* Back button */}
        <div className="absolute top-2 md:top-4 left-2 md:left-4 z-20">
          <button
            onClick={() => {
              setMode('selection');
              setMovies([]);
              setCurrentIndex(0);
            }}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-md text-sm md:text-base"
          >
            ← <span className="hidden sm:inline">Changer de catégorie</span><span className="sm:hidden">Retour</span>
          </button>
        </div>

        {loadingMovies ? (
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
          </div>
        ) : !currentMovie ? (
          <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-12 text-center shadow-lg mx-4">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-3 md:mb-4">
              C'est tout pour aujourd'hui
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">
              Revenez demain pour découvrir de nouveaux films
            </p>
            <button
              onClick={() => {
                setMode('selection');
                setMovies([]);
                setCurrentIndex(0);
              }}
              className="inline-block px-6 md:px-8 py-3 md:py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-semibold text-sm md:text-base"
            >
              Choisir une nouvelle catégorie
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mt-16 md:mt-0">
            {/* Movie Card */}
            <div
              className={`transition-all duration-500 ease-out w-full max-w-sm md:w-auto ${
                swipeDirection === 'left'
                  ? 'opacity-0 -translate-x-[200px] -rotate-45 scale-75'
                  : swipeDirection === 'right'
                  ? 'opacity-0 translate-x-[200px] rotate-45 scale-75'
                  : swipeDirection === 'up'
                  ? 'opacity-0 -translate-y-[200px] scale-75'
                  : 'opacity-100 translate-x-0 translate-y-0 rotate-0 scale-100'
              }`}
            >
              {/* Title above poster */}
              <h2 className="text-black text-xl md:text-2xl font-bold mb-4 text-center px-4">
                {currentMovie.title || currentMovie.name}
              </h2>

              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl md:w-[420px]">
                <div className="relative aspect-[2/3] w-full">
                  {currentMovie.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w780${currentMovie.poster_path}`}
                      alt={currentMovie.title || currentMovie.name || ''}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-2xl">Pas d'affiche</span>
                    </div>
                  )}

                  {/* Rating overlay when active */}
                  {showRating && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                      <div className="text-center px-4">
                        <p className="text-white text-base md:text-lg mb-4 md:mb-6">Votre note</p>
                        <div className="flex gap-2 md:gap-4 mb-4 md:mb-6">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRatingClick(star)}
                              className="transition-all hover:scale-125 active:scale-110"
                            >
                              <Star
                                className={`w-10 h-10 md:w-12 md:h-12 ${
                                  selectedRating && selectedRating >= star
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-white/40 hover:text-white/60'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => handleAddWatched(false)}
                          className="text-white/60 hover:text-white text-xs md:text-sm underline"
                        >
                          Sans noter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row md:flex-col gap-4 md:gap-6">
              <button
                onClick={handleDislike}
                disabled={swipeDirection !== null}
                className="group relative"
              >
                <div className="w-20 h-20 md:w-16 md:h-16 rounded-full bg-white border-2 border-gray-200 hover:border-red-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 shadow-lg">
                  <X className="w-10 h-10 md:w-8 md:h-8 text-gray-400 group-hover:text-red-500 transition-colors" />
                </div>
              </button>

              <button
                onClick={handleWatchlist}
                disabled={swipeDirection !== null}
                className="group relative"
              >
                <div className="w-20 h-20 md:w-16 md:h-16 rounded-full bg-white border-2 border-gray-200 hover:border-blue-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 shadow-lg">
                  <Bookmark className="w-9 h-9 md:w-7 md:h-7 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </div>
              </button>

              <button
                onClick={handleLike}
                disabled={swipeDirection !== null || showRating}
                className="group relative"
              >
                <div className="w-20 h-20 md:w-16 md:h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 shadow-lg">
                  <Heart className="w-10 h-10 md:w-8 md:h-8 text-white fill-white" />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
