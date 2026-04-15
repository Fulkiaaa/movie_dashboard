'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Calendar, Star, Film, X, Download, Shield, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { moviesService, UserMovie } from '@/services/movies';
import { tmdbService } from '@/services/tmdb';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [favorites, setFavorites] = useState<UserMovie[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [exportingData, setExportingData] = useState(false);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const favs = await moviesService.getFavorites();
      setFavorites(favs);
      const count = await moviesService.getFavoritesCount();
      setFavoritesCount(count);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    try {
      await moviesService.toggleFavorite(id);
      await loadFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Erreur lors de la suppression du favori');
    }
  };

  const exportData = async () => {
    setExportingData(true);
    try {
      const allMovies = await moviesService.getUserMovies();

      const BOM = '\uFEFF';
      const csvHeaders = 'Statut,Titre,Type,Date d\'ajout,Date de sortie,Note\n';
      const csvRows = allMovies.map(movie => {
        const status = movie.status === 'watched' ? 'Vu' : 'À voir';
        const title = `"${movie.title.replace(/"/g, '""')}"`;
        const mediaType = movie.media_type === 'movie' ? 'Film' : 'Série';
        const addedDate = new Date(movie.created_at).toLocaleDateString('fr-FR');
        const releaseDate = movie.release_date || 'N/A';
        const rating = movie.rating ? movie.rating.toString() : 'N/A';

        return `${status},${title},${mediaType},${addedDate},${releaseDate},${rating}`;
      }).join('\n');

      const csvContent = BOM + csvHeaders + csvRows;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `seenit_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Erreur lors de l\'export des données');
    } finally {
      setExportingData(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F4F1] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F95C4B]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F6F4F1] flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-[#B8B0A0] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#0D0D0D] mb-2">Connexion requise</h1>
          <p className="text-[#B8B0A0] mb-6">Connectez-vous pour voir votre profil</p>
          <Link href="/auth/login" className="px-6 py-3 bg-[#F95C4B] text-[#F6F4F1] rounded-lg hover:bg-[#C7392A] transition-all">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F4F1] py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-3 md:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0D0D0D] mb-1 md:mb-2">Mon Profil</h1>
          <p className="text-sm md:text-base text-[#B8B0A0]">Gérez vos informations et favoris</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-[#F6F4F1] border border-[#E4DED2] rounded-2xl p-4 md:p-6 shadow-[0_1px_3px_rgba(13,13,13,0.06)] lg:sticky lg:top-8">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-4 md:mb-6 pb-4 md:pb-6 border-b border-[#E4DED2]">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#0D0D0D] flex items-center justify-center mb-3 md:mb-4">
                  <User className="w-8 h-8 md:w-10 md:h-10 text-[#F6F4F1]" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-[#0D0D0D] mb-1 text-center">
                  {user.email?.split('@')[0]}
                </h2>
                <p className="text-[#B8B0A0] text-sm">Membre SeenIt</p>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-[#E4DED2] rounded-lg">
                  <Mail className="w-5 h-5 text-[#0D0D0D] mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#B8B0A0] mb-1">Email</p>
                    <p className="text-sm text-[#0D0D0D] font-medium truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#E4DED2] rounded-lg">
                  <Calendar className="w-5 h-5 text-[#0D0D0D] mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-[#B8B0A0] mb-1">Membre depuis</p>
                    <p className="text-sm text-[#0D0D0D] font-medium">
                      {new Date().toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#E4DED2] rounded-lg">
                  <Star className="w-5 h-5 text-[#D4A843] mt-0.5 fill-[#D4A843]" />
                  <div className="flex-1">
                    <p className="text-xs text-[#B8B0A0] mb-1">Favoris</p>
                    <p className="text-sm text-[#0D0D0D] font-medium">
                      {favoritesCount} / 10 films
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-[#E4DED2] space-y-3">
                <button
                  onClick={exportData}
                  disabled={exportingData}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#F95C4B] text-[#F6F4F1] rounded-lg hover:bg-[#C7392A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {exportingData ? 'Export en cours...' : 'Exporter mes données'}
                  </span>
                </button>

                <Link
                  href="/profile/donnees"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#E4DED2] hover:bg-[#D6CFBF] text-[#0D0D0D] rounded-lg transition-all"
                >
                  <Shield className="w-4 h-4 text-[#F95C4B]" />
                  <span className="text-sm font-medium">Mes données &amp; droits RGPD</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="block text-center text-[#B8B0A0] hover:text-[#0D0D0D] underline text-xs md:text-sm"
                >
                  ← Retour au Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Favorites Section */}
          <div className="lg:col-span-2">
            <div className="bg-[#F6F4F1] border border-[#E4DED2] rounded-2xl p-4 md:p-6 shadow-[0_1px_3px_rgba(13,13,13,0.06)]">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <Star className="w-5 h-5 md:w-6 md:h-6 text-[#D4A843] fill-[#D4A843]" />
                  <div>
                    <h2 className="text-lg md:text-2xl font-bold text-[#0D0D0D]">Mes Favoris</h2>
                    <div className="w-8 h-0.5 bg-[#F95C4B] mt-1"></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs md:text-sm text-[#B8B0A0]">
                    {favoritesCount} / 10
                  </span>
                  {favoritesCount < 10 && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D0D0D] text-[#F6F4F1] rounded-lg hover:bg-[#2A2A2A] transition-all text-xs font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter
                    </Link>
                  )}
                </div>
              </div>

              {loadingFavorites ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F95C4B]"></div>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Film className="w-16 h-16 text-[#B8B0A0] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#B8B0A0] mb-2">
                    Aucun favori
                  </h3>
                  <p className="text-[#B8B0A0] mb-6">
                    Ajoutez vos films préférés en cliquant sur l'icône cœur
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-block px-6 py-3 bg-[#F95C4B] text-[#F6F4F1] rounded-lg hover:bg-[#C7392A] transition-all"
                  >
                    Découvrir des films
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-xs md:text-sm text-[#B8B0A0] mb-4 md:mb-6">
                    Vous pouvez ajouter jusqu'à 10 films favoris.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {favorites.map((movie) => (
                      <div key={movie.id} className="relative group">
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveFavorite(movie.id)}
                          className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-[#0D0D0D] text-[#F6F4F1] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#C7392A]"
                          title="Retirer des favoris"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Movie Card */}
                        <div className="aspect-2/3 bg-[#E4DED2] rounded-lg overflow-hidden border border-[#E4DED2] group-hover:border-[#F95C4B] transition-colors">
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
                              <Film className="w-12 h-12" />
                            </div>
                          )}
                        </div>

                        <h3 className="text-sm font-medium text-[#0D0D0D] mt-2 line-clamp-2">
                          {movie.title}
                        </h3>
                        {movie.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-[#D4A843] text-[#D4A843]" />
                            <span className="text-xs text-[#B8B0A0]">{movie.rating}/5</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {favoritesCount < 10 && (
                    <div className="mt-6 p-4 bg-[#E4DED2] rounded-lg text-center">
                      <p className="text-sm text-[#B8B0A0]">
                        Vous pouvez ajouter encore {10 - favoritesCount} film{10 - favoritesCount > 1 ? 's' : ''} favori{10 - favoritesCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
