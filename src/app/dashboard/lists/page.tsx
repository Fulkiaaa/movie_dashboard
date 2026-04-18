'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, List, Film, Trash2, X, ChevronRight } from 'lucide-react';
import { listsService, UserList } from '@/services/lists';
import { tmdbService } from '@/services/tmdb';

// ─── List cover mosaic ────────────────────────────────────────────────────────

function ListCover({ posters, name }: { posters: string[]; name: string }) {
  if (posters.length === 0) {
    return (
      <div className="aspect-square bg-[#E4DED2] rounded-xl flex items-center justify-center">
        <List className="w-8 h-8 text-[#B8B0A0]" />
      </div>
    );
  }
  if (posters.length < 4) {
    return (
      <div className="aspect-square rounded-xl overflow-hidden relative bg-[#E4DED2]">
        <Image
          src={tmdbService.getImageUrl(posters[0], 'w200')}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div className="aspect-square rounded-xl overflow-hidden grid grid-cols-2 gap-px bg-[#E4DED2]">
      {posters.slice(0, 4).map((p, i) => (
        <div key={i} className="relative">
          <Image src={tmdbService.getImageUrl(p, 'w200')} alt="" fill className="object-cover" />
        </div>
      ))}
    </div>
  );
}

// ─── Create list modal ────────────────────────────────────────────────────────

function CreateListModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (list: UserList) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const list = await listsService.createList(name.trim(), description.trim() || undefined);
      onCreate(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0D0D0D]/50 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="glass-warm rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#0D0D0D]">Nouvelle liste</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#EBE7E0] transition-colors cursor-pointer">
            <X className="w-5 h-5 text-[#0D0D0D]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0D0D0D] mb-1.5">Nom *</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={100}
              placeholder="Films de Noël, Kubrick, Avec ma copine…"
              className="w-full px-3 py-2.5 text-sm text-[#0D0D0D] placeholder-[#B8B0A0] bg-[#F6F4F1] border border-[#B8B0A0] rounded-lg focus:outline-none focus:border-[#F95C4B] transition-colors"
            />
            <p className="text-xs text-[#B8B0A0] mt-1 text-right">{name.length}/100</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0D0D0D] mb-1.5">Description <span className="text-[#B8B0A0] font-normal">(optionnel)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Une courte description…"
              className="w-full px-3 py-2.5 text-sm text-[#0D0D0D] placeholder-[#B8B0A0] bg-[#F6F4F1] border border-[#B8B0A0] rounded-lg focus:outline-none focus:border-[#F95C4B] transition-colors resize-none"
            />
          </div>
          {error && <p className="text-sm text-[#C7392A]">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#0D0D0D] hover:bg-[#EBE7E0] transition-colors cursor-pointer">
              Annuler
            </button>
            <button type="submit" disabled={!name.trim() || loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[#F95C4B] text-[#F6F4F1] hover:bg-[#C7392A] transition-colors disabled:opacity-50 cursor-pointer">
              {loading ? 'Création…' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ListsPage() {
  const { user, loading: authLoading } = useAuth();
  const [lists, setLists] = useState<UserList[]>([]);
  const [fetching, setFetching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    listsService.getLists()
      .then(setLists)
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm('Supprimer cette liste ?')) return;
    setDeleting(id);
    try {
      await listsService.deleteList(id);
      setLists(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F95C4B]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <Film className="w-16 h-16 text-[#B8B0A0] mx-auto mb-4" />
          <Link href="/auth/login" className="px-6 py-3 bg-[#F95C4B] text-[#F6F4F1] rounded-lg hover:bg-[#C7392A] transition-colors inline-block">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-7xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-[#0D0D0D] mb-1">Mes listes</h1>
            <p className="text-sm md:text-base text-[#B8B0A0]">
              {lists.length} liste{lists.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F95C4B] text-[#F6F4F1] rounded-xl text-sm font-medium hover:bg-[#C7392A] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvelle liste</span>
            <span className="sm:hidden">Créer</span>
          </button>
        </div>

        {/* Content */}
        {fetching ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-[#E4DED2] rounded-xl mb-3" />
                <div className="h-4 bg-[#E4DED2] rounded-lg w-3/4 mb-1.5" />
                <div className="h-3 bg-[#E4DED2] rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div className="glass-warm rounded-2xl p-12 text-center">
            <List className="w-16 h-16 text-[#B8B0A0] mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#0D0D0D] mb-2">Aucune liste pour l&apos;instant</h2>
            <p className="text-sm text-[#B8B0A0] mb-6 max-w-xs mx-auto">
              Créez des collections personnalisées — "Films de Noël", "Top 2024", "À voir en famille"…
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F95C4B] text-[#F6F4F1] rounded-xl text-sm font-medium hover:bg-[#C7392A] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Créer ma première liste
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {lists.map(list => (
              <Link key={list.id} href={`/dashboard/lists/${list.id}`} className="group relative">
                {/* Cover */}
                <div className="mb-3 transition-transform duration-200 group-hover:scale-[1.02]">
                  <ListCover posters={list.preview_posters} name={list.name} />
                </div>

                {/* Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#0D0D0D] truncate group-hover:text-[#F95C4B] transition-colors">
                      {list.name}
                    </h3>
                    <p className="text-xs text-[#B8B0A0] mt-0.5">
                      {list.movie_count} film{list.movie_count !== 1 ? 's' : ''}
                    </p>
                    {list.description && (
                      <p className="text-xs text-[#B8B0A0] mt-0.5 line-clamp-1">{list.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={e => handleDelete(e, list.id)}
                      disabled={deleting === list.id}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#FDE8E5] transition-all cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#C7392A]" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-[#B8B0A0] group-hover:text-[#F95C4B] transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateListModal
          onClose={() => setShowCreate(false)}
          onCreate={list => {
            setLists(prev => [list, ...prev]);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}
