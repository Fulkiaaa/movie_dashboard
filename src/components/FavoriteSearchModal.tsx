'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Plus, Check, Film } from 'lucide-react';
import Image from 'next/image';
import { tmdbService, Movie } from '@/services/tmdb';
import { moviesService } from '@/services/movies';

interface FavoriteSearchModalProps {
  currentCount: number;
  maxCount?: number;
  onClose: () => void;
  onFavoriteAdded: () => void;
}

export default function FavoriteSearchModal({
  currentCount,
  maxCount = 10,
  onClose,
  onFavoriteAdded,
}: FavoriteSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [existingFavoriteIds, setExistingFavoriteIds] = useState<Set<number>>(new Set());
  const [slotsLeft, setSlotsLeft] = useState(maxCount - currentCount);

  // Load existing favorites on mount
  useEffect(() => {
    moviesService.getFavorites().then((favs) => {
      setExistingFavoriteIds(new Set(favs.map((f) => f.tmdb_id)));
    }).catch(() => {});
  }, []);

  // Dismiss on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await tmdbService.searchMulti(query.trim());
        // Only movies and TV, filter out results without poster
        setResults(
          data.results
            .filter((m) => (m.media_type === 'movie' || m.media_type === 'tv') && m.poster_path)
            .slice(0, 12)
        );
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 380);
    return () => clearTimeout(timer);
  }, [query]);

  const handleAdd = useCallback(async (movie: Movie) => {
    if (slotsLeft <= 0) return;
    setAddingId(movie.id);
    try {
      const existing = await moviesService.getMovieByTmdbId(
        movie.id,
        (movie.media_type as 'movie' | 'tv') || 'movie'
      );

      if (existing) {
        if (!existing.is_favorite) {
          await moviesService.toggleFavorite(existing.id);
        }
      } else {
        const added = await moviesService.addMovie({
          tmdb_id: movie.id,
          media_type: (movie.media_type as 'movie' | 'tv') || 'movie',
          title: movie.title || movie.name || '',
          poster_path: movie.poster_path,
          release_date: movie.release_date || movie.first_air_date || null,
          status: 'watchlist',
        });
        await moviesService.toggleFavorite(added.id);
      }

      setAddedIds((prev) => new Set([...prev, movie.id]));
      setSlotsLeft((prev) => prev - 1);
      onFavoriteAdded();
    } catch (error) {
      console.error('Error adding favorite:', error);
    } finally {
      setAddingId(null);
    }
  }, [slotsLeft, onFavoriteAdded]);

  const isAdded = (tmdbId: number) =>
    addedIds.has(tmdbId) || existingFavoriteIds.has(tmdbId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(13, 13, 13, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#F6F4F1] rounded-2xl shadow-[0_8px_24px_rgba(13,13,13,0.18)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E4DED2]">
          <div>
            <h2 className="text-lg font-bold text-[#0D0D0D]">Ajouter un favori</h2>
            <p className="text-xs text-[#B8B0A0] mt-0.5">
              {slotsLeft} emplacement{slotsLeft > 1 ? 's' : ''} disponible{slotsLeft > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E4DED2] hover:bg-[#D6CFBF] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#0D0D0D]" />
          </button>
        </div>

        {/* Search input */}
        <div className="px-5 py-3 border-b border-[#E4DED2]">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F6F4F1] border border-[#B8B0A0] rounded-lg focus-within:border-[#F95C4B] transition-colors">
            <Search className="w-4 h-4 text-[#B8B0A0] shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Rechercher un film ou une série..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[#0D0D0D] placeholder-[#B8B0A0] outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X className="w-3.5 h-3.5 text-[#B8B0A0] hover:text-[#0D0D0D] transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-[#F95C4B] border-t-transparent animate-spin" />
            </div>
          ) : results.length === 0 && query.trim() ? (
            <div className="text-center py-10">
              <Film className="w-10 h-10 text-[#B8B0A0] mx-auto mb-2" />
              <p className="text-sm text-[#B8B0A0]">Aucun résultat pour « {query} »</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-10">
              <Search className="w-10 h-10 text-[#B8B0A0] mx-auto mb-2" />
              <p className="text-sm text-[#B8B0A0]">Tapez le nom d'un film ou d'une série</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#E4DED2]">
              {results.map((movie) => {
                const title = movie.title || movie.name || '';
                const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
                const added = isAdded(movie.id);
                const adding = addingId === movie.id;
                const full = slotsLeft <= 0 && !added;

                return (
                  <li key={movie.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#EBE7E0] transition-colors">
                    {/* Poster */}
                    <div className="w-10 h-14 rounded-md overflow-hidden shrink-0 bg-[#E4DED2]">
                      {movie.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={title}
                          width={40}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-4 h-4 text-[#B8B0A0]" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0D0D0D] truncate">{title}</p>
                      <p className="text-xs text-[#B8B0A0]">
                        {year && <span>{year}</span>}
                        {year && movie.media_type && <span> · </span>}
                        {movie.media_type === 'tv' ? 'Série' : 'Film'}
                      </p>
                    </div>

                    {/* Add button */}
                    <button
                      onClick={() => !added && !full && handleAdd(movie)}
                      disabled={added || adding || full}
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        added
                          ? 'bg-[#D4A843] cursor-default'
                          : full
                          ? 'bg-[#E4DED2] cursor-not-allowed opacity-50'
                          : 'bg-[#0D0D0D] hover:bg-[#F95C4B]'
                      }`}
                      title={added ? 'Déjà en favoris' : full ? 'Limite atteinte' : 'Ajouter aux favoris'}
                    >
                      {adding ? (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : added ? (
                        <Check className="w-4 h-4 text-[#F6F4F1]" />
                      ) : (
                        <Plus className="w-4 h-4 text-[#F6F4F1]" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer when full */}
        {slotsLeft <= 0 && (
          <div className="px-5 py-3 border-t border-[#E4DED2] bg-[#E4DED2]">
            <p className="text-xs text-center text-[#B8B0A0]">
              Limite de 10 favoris atteinte. Retirez un favori pour en ajouter un nouveau.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
