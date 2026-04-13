"use client";

import { useState, useEffect } from "react";
import {
  X,
  Star,
  Eye,
  Clock,
  Calendar,
  Film as FilmIcon,
  Heart,
} from "lucide-react";
import HalfStarRating from "@/components/HalfStarRating";
import { tmdbService, Movie, MovieDetails } from "@/services/tmdb";
import { moviesService, UserMovie } from "@/services/movies";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function MovieModal({
  movie,
  onClose,
  onUpdate,
}: MovieModalProps) {
  const { user } = useAuth();
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [userMovie, setUserMovie] = useState<UserMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [status, setStatus] = useState<"watched" | "watchlist" | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  useEffect(() => {
    loadMovieData();
  }, [movie.id]);

  const loadMovieData = async () => {
    setLoading(true);
    try {
      const movieDetails =
        movie.media_type === "movie"
          ? await tmdbService.getMovieDetails(movie.id)
          : await tmdbService.getTVDetails(movie.id);

      setDetails(movieDetails);

      if (user) {
        const existingMovie = await moviesService.getMovieByTmdbId(
          movie.id,
          movie.media_type,
        );

        if (existingMovie) {
          setUserMovie(existingMovie);
          setStatus(existingMovie.status);
          setSelectedRating(existingMovie.rating);
          setIsFavorite(existingMovie.is_favorite || false);
        }
      }
    } catch (error) {
      console.error("Error loading movie data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newStatus: "watched" | "watchlist") => {
    if (!user) return;

    setSaving(true);
    try {
      const params = {
        tmdb_id: movie.id,
        media_type: movie.media_type,
        title: movie.title || movie.name || "",
        poster_path: movie.poster_path,
        release_date: movie.release_date || movie.first_air_date || null,
        status: newStatus,
        rating: newStatus === "watched" ? selectedRating : null,
      };

      const savedMovie = await moviesService.upsertMovie(params);
      setUserMovie(savedMovie);
      setStatus(savedMovie.status);

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving movie:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !userMovie) return;

    if (!confirm("Voulez-vous vraiment supprimer ce film ?")) return;

    setSaving(true);
    try {
      await moviesService.deleteMovie(userMovie.id);
      setUserMovie(null);
      setStatus(null);
      setSelectedRating(null);
      setIsFavorite(false);

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error deleting movie:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user || !userMovie) {
      if (!userMovie) {
        alert(
          "Veuillez d'abord ajouter le film à votre collection (vu ou watchlist)",
        );
      }
      return;
    }

    setSaving(true);
    try {
      const updatedMovie = await moviesService.toggleFavorite(userMovie.id);
      setIsFavorite(updatedMovie.is_favorite);
      setUserMovie(updatedMovie);

      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      if (error.message?.includes("10 films favoris maximum")) {
        alert(
          "Vous ne pouvez avoir que 10 films favoris maximum. Retirez-en un depuis votre profil avant d'en ajouter un nouveau.",
        );
      } else {
        alert("Erreur lors de la mise à jour du favori");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0D0D0D]/50 backdrop-blur-sm p-4">
        <div className="bg-[#F6F4F1] rounded-xl md:rounded-2xl p-6 md:p-8">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-[#F95C4B]"></div>
        </div>
      </div>
    );
  }

  if (!details) return null;

  const displayTitle = details.title || details.name || "";
  const displayDate = details.release_date || details.first_air_date || "";
  const year = displayDate ? displayDate.split("-")[0] : "";

  return (
    <div
      className="fixed inset-0 z-150 flex items-end md:items-center justify-center bg-[#0D0D0D]/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#F6F4F1] w-full md:max-w-4xl md:rounded-2xl rounded-t-3xl h-[85vh] md:h-auto md:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec backdrop */}
        <div className="relative h-20 md:h-64">
          {details.backdrop_path ? (
            <Image
              src={tmdbService.getImageUrl(details.backdrop_path, "original")}
              alt={displayTitle}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#E4DED2]"></div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-[#F6F4F1] via-[#F6F4F1]/50 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-2 right-2 md:top-4 md:right-4 p-2 bg-[#F6F4F1]/90 backdrop-blur rounded-full shadow-[0_4px_12px_rgba(13,13,13,0.08)] hover:bg-[#F6F4F1] transition-colors z-10"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-[#0D0D0D]" />
          </button>

          <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#B8B0A0] rounded-full"></div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 -mt-10 md:-mt-32 relative">
          <div className="flex flex-row md:flex-row gap-3 md:gap-6 mb-4">
            <div className="w-20 md:w-48 flex-shrink-0">
              <div className="w-full aspect-[2/3] bg-[#E4DED2] rounded-lg md:rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(13,13,13,0.12)]">
                {details.poster_path ? (
                  <Image
                    src={tmdbService.getImageUrl(details.poster_path, "w500")}
                    alt={displayTitle}
                    width={192}
                    height={288}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#B8B0A0]">
                    <FilmIcon className="w-6 h-6 md:w-12 md:h-12" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="px-2 py-0.5 md:px-3 md:py-1 bg-[#E4DED2] text-[#0D0D0D] rounded-full text-xs md:text-sm font-medium">
                    {movie.media_type === "movie" ? "Film" : "Série"}
                  </span>
                  {year && (
                    <span className="text-xs md:text-base text-[#B8B0A0]">
                      {year}
                    </span>
                  )}
                </div>
                <h2 className="text-lg md:text-3xl font-bold text-[#0D0D0D] mb-1 line-clamp-2">
                  {displayTitle}
                </h2>

                {details.genres && details.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {details.genres.slice(0, 3).map((genre) => (
                      <span
                        key={genre.id}
                        className="px-1.5 py-0.5 bg-[#E4DED2] rounded-full text-xs text-[#0D0D0D]"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-[#B8B0A0] flex-wrap">
                  {details.vote_average > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 md:w-4 md:h-4 fill-[#D4A843] text-[#D4A843]" />
                      <span className="font-semibold text-[#0D0D0D]">
                        {details.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {details.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{details.runtime} min</span>
                    </div>
                  )}
                  {details.number_of_seasons && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{details.number_of_seasons} S</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {details.overview && (
            <div className="mb-3 md:mb-6">
              <h3 className="text-sm md:text-lg font-bold text-[#0D0D0D] mb-1 md:mb-2">
                Synopsis
              </h3>
              <p
                className={`text-xs md:text-base text-[#0D0D0D] leading-relaxed ${synopsisExpanded ? "" : "line-clamp-3"} md:line-clamp-none`}
              >
                {details.overview}
              </p>
              <button
                className="md:hidden mt-1 text-xs font-medium text-[#F95C4B]"
                onClick={() => setSynopsisExpanded((v) => !v)}
              >
                {synopsisExpanded ? "Réduire" : "Lire la suite"}
              </button>
            </div>
          )}

          <div className="border-t border-[#E4DED2] pt-3 md:pt-6">
            <h3 className="text-sm md:text-lg font-bold text-[#0D0D0D] mb-2 md:mb-4">
              Ma collection
            </h3>

            <div>
              <div className="mb-3 md:mb-4">
                <label className="block text-xs md:text-sm font-medium text-[#0D0D0D] mb-1.5 md:mb-2">
                  Ma note
                </label>
                <HalfStarRating
                  value={selectedRating}
                  onChange={async (newRating) => {
                    setSelectedRating(newRating);
                    if (newRating !== null) {
                      setSaving(true);
                      try {
                        const params = {
                          tmdb_id: movie.id,
                          media_type: movie.media_type,
                          title: movie.title || movie.name || "",
                          poster_path: movie.poster_path,
                          release_date:
                            movie.release_date || movie.first_air_date || null,
                          status: "watched" as const,
                          rating: newRating,
                        };
                        const savedMovie =
                          await moviesService.upsertMovie(params);
                        setUserMovie(savedMovie);
                        setStatus("watched");
                        if (onUpdate) onUpdate();
                      } catch (error) {
                        console.error("Error saving rating:", error);
                      } finally {
                        setSaving(false);
                      }
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSave("watched")}
                  disabled={saving}
                  className={`flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-base font-medium transition-all active:scale-95 ${
                    status === "watched"
                      ? "bg-[#D4A843] text-[#F6F4F1]"
                      : "bg-[#E4DED2] text-[#0D0D0D] hover:bg-[#EBE7E0]"
                  } disabled:opacity-50`}
                >
                  <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="truncate">Vu</span>
                </button>

                <button
                  onClick={() => handleSave("watchlist")}
                  disabled={saving}
                  className={`flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-base font-medium transition-all active:scale-95 ${
                    status === "watchlist"
                      ? "bg-[#D4A843] text-[#F6F4F1]"
                      : "bg-[#E4DED2] text-[#0D0D0D] hover:bg-[#EBE7E0]"
                  } disabled:opacity-50`}
                >
                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="truncate">
                    {status === "watchlist" ? "Dans liste" : "Watchlist"}
                  </span>
                </button>

                {userMovie && (
                  <button
                    onClick={handleToggleFavorite}
                    disabled={saving}
                    className={`flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-base font-medium transition-all active:scale-95 ${
                      isFavorite
                        ? "bg-[#F95C4B] text-[#F6F4F1]"
                        : "bg-[#E4DED2] text-[#0D0D0D] hover:bg-[#EBE7E0]"
                    } disabled:opacity-50`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isFavorite ? "fill-[#F6F4F1]" : ""}`}
                    />
                    <span className="truncate">Favori</span>
                  </button>
                )}

                {userMovie && (
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-base font-medium text-[#C7392A] hover:bg-[#FDE8E5] transition-all active:scale-95 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="truncate">Retirer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
