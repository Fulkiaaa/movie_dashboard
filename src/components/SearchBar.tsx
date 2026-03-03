'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { tmdbService, Movie } from '@/services/tmdb';
import Image from 'next/image';

interface SearchBarProps {
  onSelectMovie: (movie: Movie) => void;
}

export default function SearchBar({ onSelectMovie }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchMovies = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await tmdbService.searchMulti(query);
        setResults(data.results.slice(0, 8)); // Limiter à 8 résultats
        setShowResults(true);
      } catch (error) {
        console.error('Error searching movies:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchMovies, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelectMovie = (movie: Movie) => {
    onSelectMovie(movie);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-2xl z-[100]">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un film ou une série..."
          className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-4 bg-white border-2 border-gray-200 rounded-xl text-sm md:text-base text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <>
          {/* Backdrop to close */}
          <div
            className="fixed inset-0 z-[110]"
            onClick={() => setShowResults(false)}
          />

          {/* Results */}
          <div className="absolute top-full mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-[120] max-h-[60vh] md:max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 text-sm md:text-base">
                Recherche en cours...
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {results.map((movie) => (
                  <button
                    key={`${movie.media_type}-${movie.id}`}
                    onClick={() => handleSelectMovie(movie)}
                    className="w-full p-2 md:p-3 flex items-center gap-2 md:gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    {/* Poster */}
                    <div className="w-10 h-14 md:w-12 md:h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      {movie.poster_path ? (
                        <Image
                          src={tmdbService.getImageUrl(movie.poster_path, 'w200')}
                          alt={movie.title || movie.name || ''}
                          width={48}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          N/A
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black truncate text-sm md:text-base">
                        {movie.title || movie.name}
                      </h3>
                      <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                          {movie.media_type === 'movie' ? 'Film' : 'Série'}
                        </span>
                        {(movie.release_date || movie.first_air_date) && (
                          <span>
                            {(movie.release_date || movie.first_air_date || '').split('-')[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    {movie.vote_average > 0 && (
                      <div className="hidden sm:flex items-center gap-1 text-xs md:text-sm">
                        <span className="text-black font-semibold">
                          {movie.vote_average.toFixed(1)}
                        </span>
                        <span className="text-gray-400">/10</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm md:text-base">
                Aucun résultat trouvé
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
