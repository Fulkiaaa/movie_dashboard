'use client';

import { useState, useEffect } from 'react';
import { X, Star, Eye, Clock, Calendar, Film as FilmIcon, Heart } from 'lucide-react';
import { tmdbService, Movie, MovieDetails } from '@/services/tmdb';
import { moviesService, UserMovie } from '@/services/movies';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function MovieModal({ movie, onClose, onUpdate }: MovieModalProps) {
  const { supabase } = useAuth();
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [userMovie, setUserMovie] = useState<UserMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [status, setStatus] = useState<'watched' | 'watchlist' | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadMovieData();
  }, [movie.id]);

  const loadMovieData = async () => {
    setLoading(true);
    try {
      // Charger les détails depuis TMDB
      const movieDetails = movie.media_type === 'movie'
        ? await tmdbService.getMovieDetails(movie.id)
        : await tmdbService.getTVDetails(movie.id);
      
      setDetails(movieDetails);

      // Charger les données utilisateur si connecté
      if (supabase) {
        const existingMovie = await moviesService.getMovieByTmdbId(
          supabase,
          movie.id,
          movie.media_type
        );

        if (existingMovie) {
          setUserMovie(existingMovie);
          setStatus(existingMovie.status);
          setSelectedRating(existingMovie.rating);
          setIsFavorite(existingMovie.is_favorite || false);
        }
      }
    } catch (error) {
      console.error('Error loading movie data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newStatus: 'watched' | 'watchlist') => {
    if (!supabase) return;

    setSaving(true);
    try {
      const params = {
        tmdb_id: movie.id,
        media_type: movie.media_type,
        title: movie.title || movie.name || '',
        poster_path: movie.poster_path,
        release_date: movie.release_date || movie.first_air_date || null,
        status: newStatus,
        rating: newStatus === 'watched' ? selectedRating : null,
      };

      const savedMovie = await moviesService.upsertMovie(supabase, params);
      setUserMovie(savedMovie);
      setStatus(savedMovie.status);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error saving movie:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!supabase || !userMovie) return;

    if (!confirm('Voulez-vous vraiment supprimer ce film ?')) {
      return;
    }

    setSaving(true);
    try {
      await moviesService.deleteMovie(supabase, userMovie.id);
      setUserMovie(null);
      setStatus(null);
      setSelectedRating(null);
      setIsFavorite(false);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!supabase || !userMovie) {
      // Si le film n'est pas encore dans la collection, l'ajouter d'abord
      if (!userMovie) {
        alert("Veuillez d'abord ajouter le film à votre collection (vu ou watchlist)");
        return;
      }
      return;
    }

    setSaving(true);
    try {
      const updatedMovie = await moviesService.toggleFavorite(supabase, userMovie.id);
      setIsFavorite(updatedMovie.is_favorite);
      setUserMovie(updatedMovie);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      if (error.message?.includes('10 films favoris maximum')) {
        alert("Vous ne pouvez avoir que 10 films favoris maximum. Retirez-en un depuis votre profil avant d'en ajouter un nouveau.");
      } else {
        alert("Erreur lors de la mise à jour du favori");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  if (!details) return null;

  const displayTitle = details.title || details.name || '';
  const displayDate = details.release_date || details.first_air_date || '';
  const year = displayDate ? displayDate.split('-')[0] : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4">
      <div className="bg-white rounded-xl md:rounded-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        {/* Header avec backdrop */}
        <div className="relative h-40 md:h-64">
          {details.backdrop_path ? (
            <Image
              src={tmdbService.getImageUrl(details.backdrop_path, 'original')}
              alt={displayTitle}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 md:top-4 md:right-4 p-1.5 md:p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 md:p-6 -mt-20 md:-mt-32 relative">
          <div className="flex flex-col md:flex-row gap-3 md:gap-6">
            {/* Poster */}
            <div className="w-32 md:w-48 flex-shrink-0 mx-auto md:mx-0">
              <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg md:rounded-xl overflow-hidden shadow-xl">
                {details.poster_path ? (
                  <Image
                    src={tmdbService.getImageUrl(details.poster_path, 'w500')}
                    alt={displayTitle}
                    width={192}
                    height={288}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FilmIcon className="w-8 h-8 md:w-12 md:h-12" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="mb-3 md:mb-4">
                <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                  <span className="px-2 md:px-3 py-1 bg-black text-white rounded-full text-xs md:text-sm font-medium">
                    {movie.media_type === 'movie' ? 'Film' : 'Série'}
                  </span>
                  {year && (
                    <span className="text-sm md:text-base text-gray-600">{year}</span>
                  )}
                </div>
                <h2 className="text-xl md:text-3xl font-bold text-black mb-2 text-center md:text-left">{displayTitle}</h2>
                
                {/* Genres */}
                {details.genres && details.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3 justify-center md:justify-start">
                    {details.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-2 py-0.5 md:py-1 bg-gray-100 rounded text-xs md:text-sm text-gray-700"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4 text-xs md:text-sm text-gray-600 flex-wrap">
                  {details.vote_average > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-black text-black" />
                      <span className="font-semibold text-black">
                        {details.vote_average.toFixed(1)}
                      </span>
                      <span>/10</span>
                    </div>
                  )}
                  {details.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{details.runtime} min</span>
                    </div>
                  )}
                  {details.number_of_seasons && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {details.number_of_seasons} saison{details.number_of_seasons > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Overview */}
              {details.overview && (
                <div className="mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg font-bold text-black mb-2 text-center md:text-left">Synopsis</h3>
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed text-justify md:text-left">{details.overview}</p>
                </div>
              )}

              {/* User Actions */}
              <div className="border-t-2 border-gray-200 pt-4 md:pt-6">
                <h3 className="text-base md:text-lg font-bold text-black mb-3 md:mb-4 text-center md:text-left">Ma collection</h3>
                
                {/* Rating */}
                <div className="mb-3 md:mb-4">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 text-center md:text-left">
                    Ma note
                  </label>
                  <div className="flex gap-1.5 md:gap-2 justify-center md:justify-start">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setSelectedRating(rating === selectedRating ? null : rating)}
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-lg border-2 transition-colors ${
                          selectedRating && selectedRating >= rating
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-400 border-gray-200 hover:border-black active:scale-95'
                        }`}
                      >
                        <Star
                          className={`w-4 h-4 md:w-5 md:h-5 mx-auto ${
                            selectedRating && selectedRating >= rating ? 'fill-white' : ''
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  <button
                    onClick={() => handleSave('watched')}
                    disabled={saving}
                    className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all active:scale-95 ${
                      status === 'watched'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-black hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="truncate">{status === 'watched' ? 'Déjà vu' : 'Marquer comme vu'}</span>
                  </button>

                  <button
                    onClick={() => handleSave('watchlist')}
                    disabled={saving}
                    className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all active:scale-95 ${
                      status === 'watchlist'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-black hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="truncate">{status === 'watchlist' ? 'Dans watchlist' : 'Ajouter watchlist'}</span>
                  </button>

                  {userMovie && (
                    <button
                      onClick={handleToggleFavorite}
                      disabled={saving}
                      className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all active:scale-95 ${
                        isFavorite
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-black hover:bg-gray-200'
                      } disabled:opacity-50`}
                      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris (max 10)'}
                    >
                      <Heart className={`w-4 h-4 ${
                        isFavorite ? 'fill-white' : ''
                      }`} />
                      <span className="truncate">Favori</span>
                    </button>
                  )}

                  {userMovie && (
                    <button
                      onClick={handleDelete}
                      disabled={saving}
                      className="flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-lg text-sm md:text-base font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span className="truncate">Retirer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
