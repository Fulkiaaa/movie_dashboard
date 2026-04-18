'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Plus, Check, Film } from 'lucide-react';
import Image from 'next/image';
import { tmdbService, Movie } from '@/services/tmdb';
import { listsService } from '@/services/lists';

interface AddMovieToListModalProps {
  listId: string;
  listName: string;
  existingTmdbIds: Set<string>; // `${tmdb_id}-${media_type}`
  onClose: () => void;
  onMovieAdded: (movie: Movie) => void;
}

export default function AddMovieToListModal({
  listId,
  listName,
  existingTmdbIds,
  onClose,
  onMovieAdded,
}: AddMovieToListModalProps) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<Movie[]>([]);
  const [loading, setLoading]   = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set(existingTmdbIds));

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Debounced TMDB search — any movie, no watched restriction
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await tmdbService.searchMulti(query.trim());
        setResults(
          data.results
            .filter(m => (m.media_type === 'movie' || m.media_type === 'tv') && m.poster_path)
            .slice(0, 12),
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
    const key = `${movie.id}-${movie.media_type}`;
    if (addedKeys.has(key)) return;

    setAddingId(movie.id);
    try {
      await listsService.addMovie(listId, {
        tmdb_id:      movie.id,
        media_type:   (movie.media_type as 'movie' | 'tv') ?? 'movie',
        title:        movie.title || movie.name || '',
        poster_path:  movie.poster_path,
        release_date: movie.release_date || movie.first_air_date || null,
      });
      setAddedKeys(prev => new Set([...prev, key]));
      onMovieAdded(movie);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingId(null);
    }
  }, [listId, addedKeys, onMovieAdded]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(13,13,13,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#F6F4F1] rounded-2xl shadow-[0_8px_24px_rgba(13,13,13,0.18)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E4DED2]">
          <div>
            <h2 className="text-lg font-bold text-[#0D0D0D]">Ajouter à la liste</h2>
            <p className="text-xs text-[#B8B0A0] mt-0.5 truncate max-w-60">{listName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E4DED2] hover:bg-[#D6CFBF] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-[#0D0D0D]" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-[#E4DED2]">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F6F4F1] border border-[#B8B0A0] rounded-lg focus-within:border-[#F95C4B] transition-colors">
            <Search className="w-4 h-4 text-[#B8B0A0] shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Rechercher un film ou une série…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[#0D0D0D] placeholder-[#B8B0A0] outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="cursor-pointer">
                <X className="w-3.5 h-3.5 text-[#B8B0A0] hover:text-[#0D0D0D] transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto" style={{ maxHeight: 400 }}>
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
              <p className="text-sm text-[#B8B0A0]">Tapez le nom d&apos;un film ou d&apos;une série</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#E4DED2]">
              {results.map(movie => {
                const title   = movie.title || movie.name || '';
                const year    = (movie.release_date || movie.first_air_date || '').slice(0, 4);
                const key     = `${movie.id}-${movie.media_type}`;
                const added   = addedKeys.has(key);
                const adding  = addingId === movie.id;

                return (
                  <li
                    key={movie.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-[#EBE7E0] transition-colors"
                  >
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
                        {year && <span> · </span>}
                        {movie.media_type === 'tv' ? 'Série' : 'Film'}
                      </p>
                    </div>

                    {/* Add button */}
                    <button
                      onClick={() => handleAdd(movie)}
                      disabled={added || adding}
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        added
                          ? 'bg-[#6B9472] cursor-default'
                          : 'bg-[#0D0D0D] hover:bg-[#F95C4B]'
                      } disabled:opacity-60`}
                      title={added ? 'Déjà dans la liste' : 'Ajouter à la liste'}
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
      </div>
    </div>
  );
}
