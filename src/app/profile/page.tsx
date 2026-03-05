'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Calendar, Star, Heart, Film, X, Download } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { moviesService, UserMovie } from '@/services/movies';
import { tmdbService } from '@/services/tmdb';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, loading, supabase } = useAuth();
  const [favorites, setFavorites] = useState<UserMovie[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [exportingData, setExportingData] = useState(false);

  useEffect(() => {
    if (user && supabase) {
      loadFavorites();
    }
  }, [user, supabase]);

  const loadFavorites = async () => {
    if (!supabase) return;

    setLoadingFavorites(true);
    try {
      const favs = await moviesService.getFavorites(supabase);
      setFavorites(favs);
      const count = await moviesService.getFavoritesCount(supabase);
      setFavoritesCount(count);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    if (!supabase) return;

    try {
      await moviesService.toggleFavorite(supabase, id);
      await loadFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Erreur lors de la suppression du favori');
    }
  };

  const exportData = async () => {
    if (!supabase) return;

    setExportingData(true);
    try {
      // Récupérer tous les films de l'utilisateur
      const allMovies = await moviesService.getUserMovies(supabase);

      // Créer le contenu CSV avec BOM UTF-8 pour l'encodage correct
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

      // Créer un blob et télécharger le fichier
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-6">
            Connectez-vous pour voir votre profil
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

  return (
    <div className="min-h-screen bg-white py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-3 md:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-1 md:mb-2">Mon Profil</h1>
          <p className="text-sm md:text-base text-gray-600">Gérez vos informations et favoris</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 md:p-6 lg:sticky lg:top-8">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-200">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black flex items-center justify-center mb-3 md:mb-4">
                  <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-black mb-1 text-center">
                  {user.email?.split('@')[0]}
                </h2>
                <p className="text-gray-600 text-sm">Membre SeenIt</p>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-700 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <p className="text-sm text-black font-medium truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-700 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Membre depuis</p>
                    <p className="text-sm text-black font-medium">
                      {new Date(user.created_at || '').toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Heart className="w-5 h-5 text-gray-700 mt-0.5 fill-black" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Favoris</p>
                    <p className="text-sm text-black font-medium">
                      {favoritesCount} / 10 films
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 space-y-3">
                <button
                  onClick={exportData}
                  disabled={exportingData}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {exportingData ? 'Export en cours...' : 'Exporter mes données'}
                  </span>
                </button>
                
                <Link
                  href="/dashboard"
                  className="block text-center text-gray-700 hover:text-black underline text-xs md:text-sm"
                >
                  ← Retour au Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Favorites Section */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <Heart className="w-5 h-5 md:w-6 md:h-6 text-black fill-black" />
                  <h2 className="text-lg md:text-2xl font-bold text-black">Mes Favoris</h2>
                </div>
                <span className="text-xs md:text-sm text-gray-600">
                  {favoritesCount} / 10
                </span>
              </div>

              {loadingFavorites ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Aucun favori
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Ajoutez vos films préférés en cliquant sur l'icône cœur
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                  >
                    Découvrir des films
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
                    Vous pouvez ajouter jusqu'à 10 films favoris.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {favorites.map((movie) => (
                      <div
                        key={movie.id}
                        className="relative group"
                      >
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveFavorite(movie.id)}
                          className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Retirer des favoris"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Movie Card */}
                        <div className="aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-black transition-colors">
                          {movie.poster_path ? (
                            <Image
                              src={tmdbService.getImageUrl(movie.poster_path, 'w300')}
                              alt={movie.title}
                              width={200}
                              height={300}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Film className="w-12 h-12" />
                            </div>
                          )}
                        </div>
                        
                        {/* Movie Info */}
                        <h3 className="text-sm font-semibold text-black mt-2 line-clamp-2">
                          {movie.title}
                        </h3>
                        {movie.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-black text-black" />
                            <span className="text-xs text-gray-600">{movie.rating}/5</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {favoritesCount < 10 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600">
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
