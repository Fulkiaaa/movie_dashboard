'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { tmdbService, Movie } from '@/services/tmdb';
import Image from 'next/image';

interface SearchBarProps {
  onSelectMovie: (movie: Movie) => void;
  variant?: 'default' | 'hero';
}

export default function SearchBar({ onSelectMovie, variant = 'default' }: SearchBarProps) {
  const isHero = variant === 'hero';
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
        setResults(data.results.slice(0, 8));
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
    <div className="relative w-full max-w-2xl z-100">
      {/* Search Input */}
      <div className="relative">
        <Search className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 ${isHero ? 'text-white/60' : 'text-[#B8B0A0]'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un film ou une série..."
          className={[
            'w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-4 rounded-xl text-sm md:text-base focus:outline-none transition-all h-11',
            isHero
              ? 'bg-white/10 backdrop-blur-md border border-white/25 text-white placeholder-white/50 focus:border-[#F95C4B]/70 focus:bg-white/15'
              : 'bg-[#F6F4F1] border-2 border-[#B8B0A0] text-[#0D0D0D] placeholder-[#B8B0A0] focus:border-[#F95C4B]',
          ].join(' ')}
        />
        {query && (
          <button
            onClick={clearSearch}
            className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 transition-colors ${isHero ? 'text-white/60 hover:text-white' : 'text-[#B8B0A0] hover:text-[#0D0D0D]'}`}
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
            className="fixed inset-0 z-110"
            onClick={() => setShowResults(false)}
          />

          {/* Results */}
          <div className={`absolute top-full mt-2 w-full rounded-xl z-120 max-h-[60vh] md:max-h-96 overflow-y-auto ${isHero ? 'glass-dark' : 'bg-[#F6F4F1] border-2 border-[#E4DED2] shadow-[0_8px_24px_rgba(13,13,13,0.12)]'}`}>
            {isLoading ? (
              <div className="p-4 text-center text-[#B8B0A0] text-sm md:text-base">
                Recherche en cours...
              </div>
            ) : results.length > 0 ? (
              <div className={`divide-y ${isHero ? 'divide-white/10' : 'divide-[#E4DED2]'}`}>
                {results.map((movie) => (
                  <button
                    key={`${movie.media_type}-${movie.id}`}
                    onClick={() => handleSelectMovie(movie)}
                    className={`w-full p-2 md:p-3 flex items-center gap-2 md:gap-3 transition-colors text-left ${isHero ? 'hover:bg-white/10' : 'hover:bg-[#EBE7E0]'}`}
                  >
                    {/* Poster */}
                    <div className={`w-10 h-14 md:w-12 md:h-16 rounded overflow-hidden shrink-0 ${isHero ? 'bg-white/10' : 'bg-[#E4DED2]'}`}>
                      {movie.poster_path ? (
                        <Image
                          src={tmdbService.getImageUrl(movie.poster_path, 'w200')}
                          alt={movie.title || movie.name || ''}
                          width={48}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#B8B0A0] text-xs">
                          N/A
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate text-sm md:text-base ${isHero ? 'text-white' : 'text-[#0D0D0D]'}`}>
                        {movie.title || movie.name}
                      </h3>
                      <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#B8B0A0]">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isHero ? 'bg-white/15 text-white/70' : 'bg-[#E4DED2] text-[#0D0D0D]'}`}>
                          {movie.media_type === 'movie' ? 'Film' : 'Série'}
                        </span>
                        {(movie.release_date || movie.first_air_date) && (
                          <span className={isHero ? 'text-white/50' : ''}>
                            {(movie.release_date || movie.first_air_date || '').split('-')[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    {movie.vote_average > 0 && (
                      <div className="hidden sm:flex items-center gap-1 text-xs md:text-sm">
                        <span className={`font-semibold ${isHero ? 'text-white' : 'text-[#0D0D0D]'}`}>
                          {movie.vote_average.toFixed(1)}
                        </span>
                        <span className="text-[#B8B0A0]">/10</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-[#B8B0A0] text-sm md:text-base">
                Aucun résultat trouvé
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
