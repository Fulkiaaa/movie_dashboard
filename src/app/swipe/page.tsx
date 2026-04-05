'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Heart, X, Bookmark, Star, TrendingUp, Calendar, Film, Globe, Languages, Play, Sliders, Check } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { tmdbService, Movie } from '@/services/tmdb';
import { moviesService } from '@/services/movies';
import Image from 'next/image';

type SwipeMode = 'selection' | 'swipe' | 'customFilter';
type FilterType = 'popular' | 'topRated' | 'year' | 'genre' | 'trending' | 'custom';

interface CustomFilterParams {
  genres: number[];
  releaseDateFrom?: string;
  releaseDateTo?: string;
  languages: string[];
  countries: string[];
  certifications: string[];
  providers: number[];
  watchRegion?: string;
}

interface SwipeFilter {
  type: FilterType;
  genre?: number;
  year?: number;
  customParams?: CustomFilterParams;
}

export default function SwipePage() {
  const { user, loading } = useAuth();
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
  const [currentFilter, setCurrentFilter] = useState<SwipeFilter | null>(null);
  
  // Custom filter states
  const [customFilter, setCustomFilter] = useState<CustomFilterParams>({
    genres: [],
    languages: [],
    countries: [],
    certifications: [],
    providers: [],
    watchRegion: 'FR',
  });
  const [availableLanguages, setAvailableLanguages] = useState<{ iso_639_1: string; english_name: string }[]>([]);
  const [availableCountries, setAvailableCountries] = useState<{ iso_3166_1: string; english_name: string }[]>([]);
  const [availableProviders, setAvailableProviders] = useState<{ provider_id: number; provider_name: string; logo_path: string }[]>([]);
  const [availableCertifications, setAvailableCertifications] = useState<{ certification: string }[]>([]);
  
  // Drag states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // État pour éviter les vérifications multiples du même film
  const [checkedMovieIds, setCheckedMovieIds] = useState<Set<number>>(new Set());

  const currentMovie = movies[currentIndex];

  // Drag handlers
  const handleDragStart = (clientX: number, clientY: number) => {
    if (showRating) return; // Don't allow dragging while rating
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    setDragOffset({ x: 0, y: 0 });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const offsetX = clientX - dragStart.x;
    const offsetY = clientY - dragStart.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const swipeThreshold = 100; // pixels
    const { x, y } = dragOffset;

    // Determine swipe direction based on offset
    if (Math.abs(x) > Math.abs(y)) {
      // Horizontal swipe
      if (x > swipeThreshold) {
        // Swipe right - Like/Watched
        setDragOffset({ x: 0, y: 0 }); // Reset offset before action
        handleLike();
      } else if (x < -swipeThreshold) {
        // Swipe left - Dislike/Skip
        setDragOffset({ x: 0, y: 0 }); // Reset offset before action
        handleDislike();
      } else {
        // Not enough swipe, reset with animation
        setDragOffset({ x: 0, y: 0 });
      }
    } else {
      // Vertical swipe
      if (y < -swipeThreshold) {
        // Swipe up - Watchlist
        setDragOffset({ x: 0, y: 0 }); // Reset offset before action
        handleWatchlist();
      } else {
        // Not enough swipe, reset with animation
        setDragOffset({ x: 0, y: 0 });
      }
    }
  };

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  // Global mouse event listeners when dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handleGlobalMouseUp = () => {
      handleDragEnd();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, dragOffset]);

  // Prevent body scroll when in swipe mode
  useEffect(() => {
    if (mode === 'swipe') {
      // Prevent scrolling and pull-to-refresh on mobile
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
      };
    }
  }, [mode]);

  // Load genres and filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [movieGenres, tvGenres, languages, countries, providers, certifications] = await Promise.all([
          tmdbService.getMovieGenres(),
          tmdbService.getTVGenres(),
          tmdbService.getLanguages(),
          tmdbService.getCountries(),
          tmdbService.getWatchProviders('FR'),
          tmdbService.getMovieCertifications(),
        ]);
        
        // Combiner et dédupliquer les genres
        const allGenres = [...movieGenres, ...tvGenres];
        const uniqueGenres = Array.from(
          new Map(allGenres.map(g => [g.id, g])).values()
        );
        setGenres(uniqueGenres.sort((a, b) => a.name.localeCompare(b.name)));
        
        // Langues populaires en priorité
        const popularLanguages = ['fr', 'en', 'es', 'de', 'it', 'ja', 'ko', 'zh'];
        const sortedLanguages = languages.sort((a, b) => {
          const aIndex = popularLanguages.indexOf(a.iso_639_1);
          const bIndex = popularLanguages.indexOf(b.iso_639_1);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.english_name.localeCompare(b.english_name);
        });
        setAvailableLanguages(sortedLanguages);
        
        // Pays
        setAvailableCountries(countries.sort((a, b) => a.english_name.localeCompare(b.english_name)));
        
        // Providers
        setAvailableProviders(providers.results || []);
        
        // Certifications françaises
        const frCerts = certifications.certifications?.FR || [];
        setAvailableCertifications(frCerts);
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };

    loadFilterOptions();
  }, []);

  // Vérifier que le film actuel n'est pas déjà dans la base de données
  useEffect(() => {
    const checkCurrentMovie = async () => {
      if (!currentMovie || mode !== 'swipe') return;
      
      // Éviter de vérifier le même film plusieurs fois
      if (checkedMovieIds.has(currentMovie.id)) return;

      try {
        const existingMovie = await moviesService.getMovieByTmdbId(
          currentMovie.id,
          currentMovie.media_type || 'movie'
        );

        // Marquer ce film comme vérifié
        setCheckedMovieIds(prev => new Set([...prev, currentMovie.id]));

        // Si le film existe déjà (watchlist ou watched), passer au suivant
        if (existingMovie) {
          console.log(`Film déjà présent détecté: ${currentMovie.title || currentMovie.name}, status: ${existingMovie.status}`);
          setExcludedMovieIds(prev => new Set([...prev, currentMovie.id]));
          const nextIndex = currentIndex + 1;
          if (nextIndex < movies.length) {
            setCurrentIndex(nextIndex);
          }
          return;
        }

        // Vérifier aussi dans les skippés
        const skippedIds = await moviesService.getSkippedMovieIds();
        if (skippedIds.includes(currentMovie.id)) {
          console.log(`Film skippé détecté: ${currentMovie.title || currentMovie.name}`);
          setExcludedMovieIds(prev => new Set([...prev, currentMovie.id]));
          const nextIndex = currentIndex + 1;
          if (nextIndex < movies.length) {
            setCurrentIndex(nextIndex);
          }
        }
      } catch (error) {
        console.error('Error checking current movie:', error);
      }
    };

    checkCurrentMovie();
  }, [currentMovie?.id, mode]);

  // Load movies based on selected filter
  const loadMoviesWithFilter = async (filter: SwipeFilter) => {
    if (!user) return;

    try {
      setLoadingMovies(true);
      setMode('swipe');
      setCurrentFilter(filter); // Sauvegarder le filtre actuel
      
      // Récupérer les films de l'utilisateur (vus et watchlist) pour les exclure
      const [userMovies, skippedIds] = await Promise.all([
        moviesService.getUserMovies(),
        moviesService.getSkippedMovieIds(),
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

        case 'custom':
          if (filter.customParams) {
            const params = filter.customParams;
            const discoverParams: any = {
              page: 1,
            };

            if (params.genres.length > 0) {
              discoverParams.genre = params.genres[0]; // TMDB accepte un seul genre par requête
            }

            if (params.releaseDateFrom) {
              discoverParams.releaseDateGte = params.releaseDateFrom;
            }

            if (params.releaseDateTo) {
              discoverParams.releaseDateLte = params.releaseDateTo;
            }

            if (params.languages.length > 0) {
              discoverParams.language = params.languages[0];
            }

            if (params.countries.length > 0) {
              discoverParams.region = params.countries[0];
            }

            if (params.certifications.length > 0) {
              discoverParams.certification = params.certifications[0];
              discoverParams.certificationCountry = 'FR';
            }

            if (params.providers.length > 0) {
              discoverParams.withWatchProviders = params.providers.join('|');
              discoverParams.watchRegion = params.watchRegion || 'FR';
            }

            const [customMovies, customTV] = await Promise.all([
              tmdbService.discoverMovies(discoverParams),
              tmdbService.discoverTV({
                page: 1,
                genre: discoverParams.genre,
                language: discoverParams.language,
                firstAirDateGte: discoverParams.releaseDateGte,
                firstAirDateLte: discoverParams.releaseDateLte,
                withWatchProviders: discoverParams.withWatchProviders,
                watchRegion: discoverParams.watchRegion,
              }),
            ]);

            allMovies = [
              ...customMovies.results,
              ...customTV.results,
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
      setCheckedMovieIds(new Set()); // Réinitialiser les films vérifiés
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoadingMovies(false);
    }
  };

  // Load more movies when running low
  const loadMoreMovies = async () => {
    if (!currentFilter) return;

    try {
      // Rafraîchir la liste des films exclus avant de charger plus de films
      const [userMovies, skippedIds] = await Promise.all([
        moviesService.getUserMovies(),
        moviesService.getSkippedMovieIds(),
      ]);

      const refreshedExcludedIds = new Set([
        ...userMovies.map(m => m.tmdb_id),
        ...skippedIds,
      ]);
      setExcludedMovieIds(refreshedExcludedIds);

      const nextPage = Math.floor(movies.length / 20) + 2;
      let newMovies: Movie[] = [];

      // Charger la MÊME catégorie que le filtre initial
      switch (currentFilter.type) {
        case 'popular':
          const [popularMovies, popularTV] = await Promise.all([
            tmdbService.getPopularMovies(nextPage),
            tmdbService.getPopularTV(nextPage),
          ]);
          newMovies = [
            ...popularMovies.results.map(m => ({ ...m, media_type: 'movie' as const })),
            ...popularTV.results.map(m => ({ ...m, media_type: 'tv' as const })),
          ];
          break;

        case 'topRated':
          const [topRatedMovies, topRatedTV] = await Promise.all([
            tmdbService.getTopRatedMovies(nextPage),
            tmdbService.getTopRatedTV(nextPage),
          ]);
          newMovies = [
            ...topRatedMovies.results.map(m => ({ ...m, media_type: 'movie' as const })),
            ...topRatedTV.results.map(m => ({ ...m, media_type: 'tv' as const })),
          ];
          break;

        case 'trending':
          const trending = await tmdbService.getTrending('week', nextPage);
          newMovies = trending.results;
          break;

        case 'year':
          if (currentFilter.year) {
            const [moviesByYear, tvByYear] = await Promise.all([
              tmdbService.discoverMovies({ year: currentFilter.year, page: nextPage }),
              tmdbService.discoverTV({ year: currentFilter.year, page: nextPage }),
            ]);
            newMovies = [
              ...moviesByYear.results,
              ...tvByYear.results,
            ];
          }
          break;

        case 'genre':
          if (currentFilter.genre) {
            const [moviesByGenre, tvByGenre] = await Promise.all([
              tmdbService.discoverMovies({ genre: currentFilter.genre, page: nextPage }),
              tmdbService.discoverTV({ genre: currentFilter.genre, page: nextPage }),
            ]);
            newMovies = [
              ...moviesByGenre.results,
              ...tvByGenre.results,
            ];
          }
          break;

        case 'custom':
          if (currentFilter.customParams) {
            const params = currentFilter.customParams;
            const discoverParams: any = { page: nextPage };

            if (params.genres.length > 0) discoverParams.genre = params.genres[0];
            if (params.releaseDateFrom) discoverParams.releaseDateGte = params.releaseDateFrom;
            if (params.releaseDateTo) discoverParams.releaseDateLte = params.releaseDateTo;
            if (params.languages.length > 0) discoverParams.language = params.languages[0];
            if (params.countries.length > 0) discoverParams.region = params.countries[0];
            if (params.certifications.length > 0) {
              discoverParams.certification = params.certifications[0];
              discoverParams.certificationCountry = 'FR';
            }
            if (params.providers.length > 0) {
              discoverParams.withWatchProviders = params.providers.join('|');
              discoverParams.watchRegion = params.watchRegion || 'FR';
            }

            const [customMovies, customTV] = await Promise.all([
              tmdbService.discoverMovies(discoverParams),
              tmdbService.discoverTV({
                page: nextPage,
                genre: discoverParams.genre,
                language: discoverParams.language,
                firstAirDateGte: discoverParams.releaseDateGte,
                firstAirDateLte: discoverParams.releaseDateLte,
                withWatchProviders: discoverParams.withWatchProviders,
                watchRegion: discoverParams.watchRegion,
              }),
            ]);

            newMovies = [
              ...customMovies.results,
              ...customTV.results,
            ];
          }
          break;
      }

      const uniqueNewMovies = Array.from(
        new Map(newMovies.map(m => [m.id, m])).values()
      ).filter(m => !refreshedExcludedIds.has(m.id));

      const shuffled = uniqueNewMovies.sort(() => Math.random() - 0.5);
      setMovies(prev => [...prev, ...shuffled]);
    } catch (error) {
      console.error('Error loading more movies:', error);
    }
  };

  const handleDislike = async () => {
    if (!currentMovie) return;

    try {
      setSwipeDirection('left');

      // Ajouter à la liste des films skippés
      await moviesService.addSkippedMovie(
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
    if (!currentMovie) return;

    try {
      setSwipeDirection('up');

      await moviesService.addMovie({
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
    if (!currentMovie) return;

    try {
      await moviesService.addMovie({
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
            {/* Custom Filter */}
            <div className="md:col-span-2">
              <button
                onClick={() => setMode('customFilter')}
                className="group w-full p-4 md:p-8 bg-white rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-black"
              >
                <Sliders className="w-10 h-10 md:w-12 md:h-12 text-black mb-3 md:mb-4 mx-auto" />
                <h3 className="text-lg md:text-xl font-bold text-black mb-1 md:mb-2">Filtre personnalisé</h3>
                <p className="text-gray-600 text-xs md:text-sm">Créez votre propre sélection sur mesure</p>
              </button>
            </div>

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

  // Custom Filter Configuration Screen
  if (mode === 'customFilter') {
    const toggleArrayItem = (array: any[], item: any) => {
      return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
    };

    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto pb-24">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setMode('selection')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ← Retour
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black">Filtre personnalisé</h1>
              <p className="text-sm text-gray-600">Configurez vos critères de recherche</p>
            </div>
          </div>

          {/* Genres */}
          <div className="bg-white rounded-xl p-6 mb-4 shadow-sm">
            <h3 className="font-bold text-lg text-black mb-3 flex items-center gap-2">
              <Film className="w-5 h-5" />
              Genres
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {genres.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => setCustomFilter(prev => ({
                    ...prev,
                    genres: toggleArrayItem(prev.genres, genre.id),
                  }))}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    customFilter.genres.includes(genre.id)
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {customFilter.genres.includes(genre.id) && <Check className="w-4 h-4 inline mr-1" />}
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-white rounded-xl p-6 mb-4 shadow-sm">
            <h3 className="font-bold text-lg text-black mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Période de sortie
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Du</label>
                <input
                  type="date"
                  value={customFilter.releaseDateFrom || ''}
                  onChange={(e) => setCustomFilter(prev => ({ ...prev, releaseDateFrom: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Au</label>
                <input
                  type="date"
                  value={customFilter.releaseDateTo || ''}
                  onChange={(e) => setCustomFilter(prev => ({ ...prev, releaseDateTo: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-xl p-6 mb-4 shadow-sm">
            <h3 className="font-bold text-lg text-black mb-3 flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Langues originales
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {availableLanguages.slice(0, 20).map(lang => (
                <button
                  key={lang.iso_639_1}
                  onClick={() => setCustomFilter(prev => ({
                    ...prev,
                    languages: toggleArrayItem(prev.languages, lang.iso_639_1),
                  }))}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    customFilter.languages.includes(lang.iso_639_1)
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {customFilter.languages.includes(lang.iso_639_1) && <Check className="w-3 h-3 inline mr-1" />}
                  {lang.english_name}
                </button>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div className="bg-white rounded-xl p-6 mb-4 shadow-sm">
            <h3 className="font-bold text-lg text-black mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Pays de production
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {availableCountries.slice(0, 30).map(country => (
                <button
                  key={country.iso_3166_1}
                  onClick={() => setCustomFilter(prev => ({
                    ...prev,
                    countries: toggleArrayItem(prev.countries, country.iso_3166_1),
                  }))}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    customFilter.countries.includes(country.iso_3166_1)
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {customFilter.countries.includes(country.iso_3166_1) && <Check className="w-3 h-3 inline mr-1" />}
                  {country.english_name}
                </button>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {availableCertifications.length > 0 && (
            <div className="bg-white rounded-xl p-6 mb-4 shadow-sm">
              <h3 className="font-bold text-lg text-black mb-3 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Classification (France)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availableCertifications.map(cert => (
                  <button
                    key={cert.certification}
                    onClick={() => setCustomFilter(prev => ({
                      ...prev,
                      certifications: toggleArrayItem(prev.certifications, cert.certification),
                    }))}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      customFilter.certifications.includes(cert.certification)
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {customFilter.certifications.includes(cert.certification) && <Check className="w-4 h-4 inline mr-1" />}
                    {cert.certification}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Streaming Providers */}
          {availableProviders.length > 0 && (
            <div className="bg-white rounded-xl p-6 mb-4 shadow-sm">
              <h3 className="font-bold text-lg text-black mb-3 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Plateformes de streaming
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableProviders.slice(0, 18).map(provider => (
                  <button
                    key={provider.provider_id}
                    onClick={() => setCustomFilter(prev => ({
                      ...prev,
                      providers: toggleArrayItem(prev.providers, provider.provider_id),
                    }))}
                    className={`relative p-3 rounded-lg transition-all ${
                      customFilter.providers.includes(provider.provider_id)
                        ? 'ring-4 ring-black bg-gray-100'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={provider.provider_name}
                  >
                    {provider.logo_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt={provider.provider_name}
                        width={60}
                        height={60}
                        className="rounded-lg mx-auto"
                      />
                    ) : (
                      <div className="w-15 h-15 bg-gray-300 rounded-lg flex items-center justify-center text-xs text-center">
                        {provider.provider_name}
                      </div>
                    )}
                    {customFilter.providers.includes(provider.provider_id) && (
                      <div className="absolute -top-2 -right-2 bg-black rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fixed bottom action button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => {
                  loadMoviesWithFilter({ 
                    type: 'custom', 
                    customParams: customFilter 
                  });
                }}
                disabled={
                  customFilter.genres.length === 0 && 
                  customFilter.languages.length === 0 && 
                  customFilter.countries.length === 0 && 
                  customFilter.certifications.length === 0 && 
                  customFilter.providers.length === 0 &&
                  !customFilter.releaseDateFrom &&
                  !customFilter.releaseDateTo
                }
                className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              >
                🎬 Découvrir les films
              </button>
              <p className="text-center text-xs text-gray-500 mt-2">
                Sélectionnez au moins un critère pour commencer
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Swipe Screen
  return (
    <div className="min-h-screen overflow-hidden bg-gray-50 flex items-start justify-center pt-6 md:pt-8 px-2 md:px-4 touch-none">
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
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mt-0 md:mt-0">
            {/* Movie Card */}
            <div
              className={`relative w-[85vw] max-w-[340px] md:max-w-[420px] ${
                swipeDirection === 'left'
                  ? 'opacity-0 -translate-x-[200px] -rotate-45 scale-75 transition-all duration-500 ease-out'
                  : swipeDirection === 'right'
                  ? 'opacity-0 translate-x-[200px] rotate-45 scale-75 transition-all duration-500 ease-out'
                  : swipeDirection === 'up'
                  ? 'opacity-0 -translate-y-[200px] scale-75 transition-all duration-500 ease-out'
                  : 'opacity-100'
              }`}
              style={
                isDragging
                  ? {
                      transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
                      transition: 'none',
                    }
                  : swipeDirection
                  ? {}
                  : dragOffset.x !== 0 || dragOffset.y !== 0
                  ? {
                      transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
                      transition: 'transform 0.3s ease-out',
                    }
                  : {
                      transform: 'translate(0px, 0px) rotate(0deg)',
                      transition: 'transform 0.3s ease-out',
                    }
              }
            >
              {/* Title above poster */}
              <h2 className="text-black text-lg md:text-2xl font-bold mb-2 md:mb-4 text-center px-4">
                {currentMovie.title || currentMovie.name}
              </h2>

              <div 
                className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl w-[85vw] max-w-[340px] md:max-w-[420px]"
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                onTouchMove={isDragging ? onTouchMove : undefined}
                onTouchEnd={onTouchEnd}
              >
                <div className="relative aspect-[2/3] w-full">
                  {currentMovie.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w780${currentMovie.poster_path}`}
                      alt={currentMovie.title || currentMovie.name || ''}
                      fill
                      sizes="(max-width: 768px) 85vw, 420px"
                      className="object-cover pointer-events-none"
                      priority
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-2xl">Pas d'affiche</span>
                    </div>
                  )}

                  {/* Swipe indicators */}
                  {isDragging && (
                    <>
                      {/* Left indicator - Dislike */}
                      <div
                        className={`absolute left-8 top-1/2 -translate-y-1/2 transition-opacity ${
                          dragOffset.x < -50 && Math.abs(dragOffset.x) > Math.abs(dragOffset.y)
                            ? 'opacity-100'
                            : 'opacity-0'
                        }`}
                      >
                        <div className="bg-red-500 rounded-full p-4 shadow-2xl">
                          <X className="w-12 h-12 text-white" strokeWidth={3} />
                        </div>
                      </div>

                      {/* Right indicator - Like */}
                      <div
                        className={`absolute right-8 top-1/2 -translate-y-1/2 transition-opacity ${
                          dragOffset.x > 50 && Math.abs(dragOffset.x) > Math.abs(dragOffset.y)
                            ? 'opacity-100'
                            : 'opacity-0'
                        }`}
                      >
                        <div className="bg-green-500 rounded-full p-4 shadow-2xl">
                          <Heart className="w-12 h-12 text-white fill-white" strokeWidth={3} />
                        </div>
                      </div>

                      {/* Up indicator - Watchlist */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 top-8 transition-opacity ${
                          dragOffset.y < -50 && Math.abs(dragOffset.y) > Math.abs(dragOffset.x)
                            ? 'opacity-100'
                            : 'opacity-0'
                        }`}
                      >
                        <div className="bg-blue-500 rounded-full p-4 shadow-2xl">
                          <Bookmark className="w-12 h-12 text-white" strokeWidth={3} />
                        </div>
                      </div>
                    </>
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

                {/* Action Buttons - Overlay en bas de l'affiche */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                  <button
                    onClick={handleDislike}
                    disabled={swipeDirection !== null}
                    className="group relative"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-red-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 shadow-lg">
                      <X className="w-7 h-7 md:w-8 md:h-8 text-gray-600 group-hover:text-red-500 transition-colors" />
                    </div>
                  </button>

                  <button
                    onClick={handleWatchlist}
                    disabled={swipeDirection !== null}
                    className="group relative"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-blue-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 shadow-lg">
                      <Bookmark className="w-6 h-6 md:w-7 md:h-7 text-gray-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </button>

                  <button
                    onClick={handleLike}
                    disabled={swipeDirection !== null || showRating}
                    className="group relative"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-500/90 backdrop-blur-sm hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 shadow-lg">
                      <Heart className="w-7 h-7 md:w-8 md:h-8 text-white fill-white" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
