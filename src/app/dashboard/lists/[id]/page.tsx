'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Film, Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import { listsService, UserList, ListMovie } from '@/services/lists';
import { tmdbService, Movie } from '@/services/tmdb';
import MovieModal from '@/components/MovieModal';
import AddMovieToListModal from '@/components/AddMovieToListModal';

type FullList = UserList & { movies: ListMovie[] };

export default function ListDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [list, setList] = useState<FullList | null>(null);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    listsService.getList(id)
      .then(data => { setList(data); setEditName(data.name); setEditDesc(data.description || ''); })
      .catch(() => router.push('/dashboard/lists'))
      .finally(() => setFetching(false));
  }, [user, id]);

  const handleSaveEdit = async () => {
    if (!list || !editName.trim()) return;
    setSaving(true);
    try {
      const updated = await listsService.updateList(id, { name: editName.trim(), description: editDesc.trim() || undefined });
      setList(prev => prev ? { ...prev, name: updated.name, description: updated.description } : prev);
      setEditing(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer cette liste ?')) return;
    await listsService.deleteList(id);
    router.push('/dashboard/lists');
  };

  const handleMovieClick = async (movie: ListMovie) => {
    try {
      const details = movie.media_type === 'movie'
        ? await tmdbService.getMovieDetails(movie.tmdb_id)
        : await tmdbService.getTVDetails(movie.tmdb_id);
      setSelectedMovie(details as Movie);
    } catch (err) { console.error(err); }
  };

  const handleMovieUpdate = () => {
    listsService.getList(id).then(setList).catch(console.error);
  };

  const handleRemoveMovie = async (e: React.MouseEvent, movie: ListMovie) => {
    e.stopPropagation();
    setRemovingIds(prev => new Set([...prev, movie.id]));
    try {
      await listsService.removeMovie(id, movie.tmdb_id, movie.media_type);
      setList(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          movie_count: prev.movie_count - 1,
          movies: prev.movies.filter(m => m.id !== movie.id),
          preview_posters: prev.preview_posters.filter(p => p !== movie.poster_path),
        };
      });
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingIds(prev => { const s = new Set(prev); s.delete(movie.id); return s; });
    }
  };

  const existingTmdbKeys = new Set(
    (list?.movies ?? []).map(m => `${m.tmdb_id}-${m.media_type}`)
  );

  if (authLoading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F95C4B]" />
      </div>
    );
  }

  if (!list) return null;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-7xl">

        {/* Back */}
        <Link href="/dashboard/lists"
          className="inline-flex items-center gap-1.5 text-sm text-[#B8B0A0] hover:text-[#0D0D0D] transition-colors mb-5">
          <ArrowLeft className="w-4 h-4" />
          Mes listes
        </Link>

        {/* Header */}
        <div className="glass-warm rounded-2xl p-5 md:p-6 mb-6">
          {editing ? (
            <div className="space-y-3">
              <input
                autoFocus
                value={editName}
                onChange={e => setEditName(e.target.value)}
                maxLength={100}
                className="w-full text-xl font-bold text-[#0D0D0D] bg-transparent border-b-2 border-[#F95C4B] outline-none pb-1"
              />
              <input
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                placeholder="Description (optionnel)"
                className="w-full text-sm text-[#B8B0A0] bg-transparent border-b border-[#E4DED2] outline-none pb-1"
              />
              <div className="flex gap-2 pt-1">
                <button onClick={handleSaveEdit} disabled={!editName.trim() || saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#F95C4B] text-[#F6F4F1] rounded-lg text-sm font-medium hover:bg-[#C7392A] transition-colors disabled:opacity-50 cursor-pointer">
                  <Check className="w-3.5 h-3.5" />
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button onClick={() => { setEditing(false); setEditName(list.name); setEditDesc(list.description || ''); }}
                  className="px-4 py-2 rounded-lg text-sm text-[#0D0D0D] hover:bg-[#EBE7E0] transition-colors cursor-pointer">
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-[#0D0D0D] mb-1">{list.name}</h1>
                {list.description && <p className="text-sm text-[#B8B0A0]">{list.description}</p>}
                <p className="text-xs text-[#B8B0A0] mt-1.5">
                  {list.movie_count} film{list.movie_count !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#F95C4B] text-[#F6F4F1] rounded-xl text-sm font-medium hover:bg-[#C7392A] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Ajouter des films</span>
                  <span className="sm:hidden">Ajouter</span>
                </button>
                <button onClick={() => setEditing(true)}
                  className="p-2 rounded-lg hover:bg-[#EBE7E0] transition-colors cursor-pointer" title="Renommer">
                  <Pencil className="w-4 h-4 text-[#B8B0A0]" />
                </button>
                <button onClick={handleDelete}
                  className="p-2 rounded-lg hover:bg-[#FDE8E5] transition-colors cursor-pointer" title="Supprimer">
                  <Trash2 className="w-4 h-4 text-[#C7392A]" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Movies grid */}
        {list.movies.length === 0 ? (
          <div className="glass-warm rounded-2xl p-12 text-center">
            <Film className="w-16 h-16 text-[#B8B0A0] mx-auto mb-4" />
            <h2 className="text-base font-bold text-[#0D0D0D] mb-2">Liste vide</h2>
            <p className="text-sm text-[#B8B0A0] mb-5">
              Recherchez directement un film ou une série à ajouter.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F95C4B] text-[#F6F4F1] rounded-xl text-sm font-medium hover:bg-[#C7392A] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Ajouter des films
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {list.movies.map(movie => (
              <div key={movie.id} className="group relative">
                {/* Poster */}
                <div
                  className="aspect-[2/3] relative bg-[#E4DED2] rounded-lg overflow-hidden mb-2 border border-[#E4DED2] group-hover:border-[#F95C4B] group-hover:shadow-[0_4px_12px_rgba(13,13,13,0.08)] transition-all cursor-pointer"
                  onClick={() => handleMovieClick(movie)}
                >
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
                      <Film className="w-8 h-8" />
                    </div>
                  )}

                  {/* Desktop — overlay au survol uniquement */}
                  <div className="absolute inset-0 bg-[#0D0D0D]/50 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-end justify-center gap-2 pb-3">
                    <button
                      onClick={e => { e.stopPropagation(); handleMovieClick(movie); }}
                      className="w-9 h-9 rounded-full bg-[#F6F4F1]/90 flex items-center justify-center hover:bg-[#F6F4F1] transition-colors cursor-pointer"
                      title="Modifier"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#0D0D0D]" />
                    </button>
                    <button
                      onClick={e => handleRemoveMovie(e, movie)}
                      disabled={removingIds.has(movie.id)}
                      className="w-9 h-9 rounded-full bg-[#F6F4F1]/90 flex items-center justify-center hover:bg-[#FDE8E5] transition-colors cursor-pointer disabled:opacity-50"
                      title="Retirer de la liste"
                    >
                      {removingIds.has(movie.id) ? (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-[#C7392A] border-t-transparent animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-[#C7392A]" />
                      )}
                    </button>
                  </div>

                  {/* Mobile — boutons toujours visibles en bas du poster */}
                  <div className="absolute bottom-0 left-0 right-0 md:hidden flex justify-end gap-1.5 px-2 pb-2 pt-6 bg-gradient-to-t from-[#0D0D0D]/60 to-transparent">
                    <button
                      onClick={e => { e.stopPropagation(); handleMovieClick(movie); }}
                      className="w-8 h-8 rounded-full bg-[#F6F4F1]/90 flex items-center justify-center active:bg-[#F6F4F1] transition-colors cursor-pointer"
                      title="Modifier"
                    >
                      <Pencil className="w-3 h-3 text-[#0D0D0D]" />
                    </button>
                    <button
                      onClick={e => handleRemoveMovie(e, movie)}
                      disabled={removingIds.has(movie.id)}
                      className="w-8 h-8 rounded-full bg-[#F6F4F1]/90 flex items-center justify-center active:bg-[#FDE8E5] transition-colors cursor-pointer disabled:opacity-50"
                      title="Retirer"
                    >
                      {removingIds.has(movie.id) ? (
                        <div className="w-3 h-3 rounded-full border-2 border-[#C7392A] border-t-transparent animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3 text-[#C7392A]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Titre + année */}
                <p
                  className="text-xs font-medium text-[#0D0D0D] line-clamp-2 group-hover:text-[#F95C4B] transition-colors cursor-pointer"
                  onClick={() => handleMovieClick(movie)}
                >
                  {movie.title}
                </p>
                {movie.release_date && (
                  <p className="text-xs text-[#B8B0A0] mt-0.5">{movie.release_date.slice(0, 4)}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onUpdate={handleMovieUpdate}
        />
      )}

      {showAddModal && list && (
        <AddMovieToListModal
          listId={id}
          listName={list.name}
          existingTmdbIds={existingTmdbKeys}
          onClose={() => setShowAddModal(false)}
          onMovieAdded={movie => {
            setList(prev => {
              if (!prev) return prev;
              const newMovie = {
                id: `${movie.id}-${movie.media_type}`,
                list_id: id,
                tmdb_id: movie.id,
                media_type: (movie.media_type as 'movie' | 'tv') ?? 'movie',
                title: movie.title || movie.name || '',
                poster_path: movie.poster_path ?? null,
                release_date: movie.release_date || movie.first_air_date || null,
                added_at: new Date().toISOString(),
              };
              return {
                ...prev,
                movie_count: prev.movie_count + 1,
                movies: [newMovie, ...prev.movies],
                preview_posters: movie.poster_path
                  ? [movie.poster_path, ...(prev.preview_posters ?? [])].slice(0, 4)
                  : (prev.preview_posters ?? []),
              };
            });
          }}
        />
      )}
    </div>
  );
}
