"use client";

import Link from "next/link";
import {
  Film,
  Star,
  TrendingUp,
  Calendar,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import SearchBar from "@/components/SearchBar";
import MovieModal from "@/components/MovieModal";
import Footer from "@/components/Footer";
import { Movie, tmdbService } from "@/services/tmdb";
import { moviesService } from "@/services/movies";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export default function Home() {
  const { user } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const trendingData = await tmdbService.getTrending("week", 1);
      const trendingMovies = trendingData.results.slice(0, 12);
      setTrending(trendingMovies);

      const withBackdrop = trendingMovies.filter((m) => m.backdrop_path);
      if (withBackdrop.length > 0) {
        setFeaturedMovie(
          withBackdrop[
            Math.floor(Math.random() * Math.min(5, withBackdrop.length))
          ],
        );
      }

      const nowPlayingData = await tmdbService.getNowPlayingMovies(1);
      setNowPlaying(nowPlayingData.results.slice(0, 12));

      if (user) {
        await loadRecommendations();
      } else {
        const topRated = await tmdbService.getTopRatedMovies(1);
        setRecommendations(topRated.results.slice(0, 12));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const allMovies = await moviesService.getUserMovies();
      const favoriteMovies = allMovies
        .filter((m) => m.rating && m.rating >= 4)
        .slice(0, 3);

      if (favoriteMovies.length > 0) {
        const allRecommendations: Movie[] = [];
        for (const movie of favoriteMovies) {
          const recs = await tmdbService.getRecommendations(
            movie.tmdb_id,
            movie.media_type as "movie" | "tv",
            1,
          );
          allRecommendations.push(...recs.results.slice(0, 4));
        }
        const uniqueRecs = Array.from(
          new Map(allRecommendations.map((m) => [m.id, m])).values(),
        ).slice(0, 12);
        setRecommendations(uniqueRecs);
      } else {
        const topRated = await tmdbService.getTopRatedMovies(1);
        setRecommendations(topRated.results.slice(0, 12));
      }
    } catch {
      const topRated = await tmdbService.getTopRatedMovies(1);
      setRecommendations(topRated.results.slice(0, 12));
    }
  };

  const handleMovieUpdate = () => {
    if (user) loadRecommendations();
  };

  const MovieCard = ({ movie }: { movie: Movie }) => (
    <button
      onClick={() => setSelectedMovie(movie)}
      className="group relative flex-shrink-0 w-[150px] md:w-[170px]"
    >
      <div
        className="aspect-[2/3] bg-[#E4DED2] rounded-xl overflow-hidden relative
                      transition-all duration-300
                      group-hover:scale-[1.04]
                      group-hover:shadow-[0_12px_32px_rgba(13,13,13,0.2)]"
      >
        {movie.poster_path ? (
          <Image
            src={tmdbService.getImageUrl(movie.poster_path, "w300")}
            alt={movie.title || movie.name || ""}
            width={200}
            height={300}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#B8B0A0]">
            <Film className="w-12 h-12" />
          </div>
        )}
        {/* Liquid glass overlay on hover */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/85 via-[#0D0D0D]/20 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300
                        flex items-end p-3"
        >
          <div className="glass rounded-lg p-2 w-full">
            <p className="text-xs text-white font-medium line-clamp-2 leading-snug">
              {movie.title || movie.name}
            </p>
            {movie.vote_average > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-[#D4A843] text-[#D4A843]" />
                <span className="text-xs text-white/80">
                  {movie.vote_average.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );

  const MovieRow = ({
    title,
    movies,
    icon: Icon,
    iconColor = "#F95C4B",
    subtitle,
  }: {
    title: string;
    movies: Movie[];
    icon: React.ElementType;
    iconColor?: string;
    subtitle?: string;
  }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateArrows = () => {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 8);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };

    const scroll = (direction: "left" | "right") => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollBy({
        left: direction === "right" ? 520 : -520,
        behavior: "smooth",
      });
    };

    return (
      <section className="mb-10 md:mb-14">
        <div className="px-4 md:px-6 lg:px-8 mb-4 md:mb-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-5 h-5" style={{ color: iconColor }} />
                <h2 className="text-lg md:text-xl font-bold text-[#0D0D0D]">
                  {title}
                </h2>
              </div>
              <div className="w-8 h-0.5 rounded-full bg-[#F95C4B]" />
              {subtitle && (
                <p className="text-sm text-[#B8B0A0] mt-1.5">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Précédent"
                className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer
                           glass-warm text-[#0D0D0D] transition-all
                           hover:shadow-md
                           disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Suivant"
                className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer
                           glass-warm text-[#0D0D0D] transition-all
                           hover:shadow-md
                           disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="flex gap-3 md:gap-4 overflow-x-auto pb-3 scrollbar-hide"
        >
          {/* Spacer gauche — plus fiable que padding-left sur un conteneur overflow */}
          <div className="shrink-0 w-4 md:w-6 lg:w-8" aria-hidden="true" />
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
          {/* Spacer droit symétrique */}
          <div className="shrink-0 w-4 md:w-6 lg:w-8" aria-hidden="true" />
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative h-[65vh] min-h-[480px] md:h-[72vh] overflow-hidden">
        {featuredMovie?.backdrop_path ? (
          <>
            <Image
              src={tmdbService.getImageUrl(
                featuredMovie.backdrop_path,
                "original",
              )}
              alt=""
              fill
              className="object-cover scale-[1.04]"
              priority
            />
            {/* Cinematic gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/50 to-[#0D0D0D]/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/70 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0D] via-[#1a1510] to-[#2a1a0e]" />
        )}

        {/* Hero content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col justify-end pb-10 md:pb-14">
          <div className="max-w-2xl">
            {/* Tagline */}
            <p className="text-white/50 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              Découvrez &amp; organisez votre cinéma
            </p>

            {/* Search Bar — liquid glass */}
            <div className="mb-6 max-w-xl">
              <SearchBar onSelectMovie={setSelectedMovie} variant="hero" />
            </div>

            {/* Featured movie info card */}
            {featuredMovie && (
              <div className="glass-dark rounded-2xl p-4 md:p-5 max-w-lg">
                <p className="text-[#F95C4B] text-[11px] font-semibold uppercase tracking-widest mb-1.5">
                  À la une cette semaine
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1.5 line-clamp-1">
                  {featuredMovie.title || featuredMovie.name}
                </h2>
                {featuredMovie.overview && (
                  <p className="text-white/55 text-sm leading-relaxed line-clamp-2 mb-4">
                    {featuredMovie.overview}
                  </p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setSelectedMovie(featuredMovie)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#F95C4B] hover:bg-[#C7392A]
                               text-white text-sm font-semibold rounded-xl transition-all"
                  >
                    <Info className="w-4 h-4" />
                    Voir les détails
                  </button>
                  {featuredMovie.vote_average > 0 && (
                    <div className="flex items-center gap-1.5 glass px-3 py-2 rounded-xl">
                      <Star className="w-4 h-4 fill-[#D4A843] text-[#D4A843]" />
                      <span className="text-white text-sm font-medium">
                        {featuredMovie.vote_average.toFixed(1)}
                      </span>
                      <span className="text-white/40 text-xs">/10</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>


      {/* ── Movie rows ───────────────────────────────────────────── */}
      <div className="py-8 md:py-12">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 rounded-full border-2 border-[#E4DED2] border-t-[#F95C4B] animate-spin" />
          </div>
        ) : (
          <>
            <MovieRow title="Tendances" movies={trending} icon={TrendingUp} />
            <MovieRow title="En salle" movies={nowPlaying} icon={Calendar} />
            <MovieRow
              title={user ? "Pour vous" : "Mieux notés"}
              movies={recommendations}
              icon={Star}
              iconColor="#D4A843"
              subtitle={
                user ? "Basé sur vos favoris" : "Les films les mieux notés"
              }
            />
          </>
        )}
      </div>

      {/* ── CTA Section (non-logged) ─────────────────────────────── */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="relative overflow-hidden bg-[#0D0D0D] rounded-2xl md:rounded-3xl p-8 md:p-14 text-center">
            {/* subtle glass shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F95C4B]/8 via-transparent to-[#D4A843]/6 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#F6F4F1] mb-3 md:mb-4 relative">
              Prêt à commencer ?
            </h2>
            <p className="text-sm md:text-base text-[#B8B0A0] mb-6 md:mb-8 max-w-xl mx-auto relative">
              Rejoignez SeenIt et construisez votre bibliothèque de films
              personnelle
            </p>
            <Link
              href="/auth/signup"
              className="relative inline-flex items-center gap-2 px-7 py-3.5 bg-[#F95C4B] hover:bg-[#C7392A]
                         text-[#F6F4F1] rounded-xl font-semibold transition-all text-sm md:text-base
                         shadow-[0_4px_20px_rgba(249,92,75,0.4)]"
            >
              Créer un compte
            </Link>
          </div>
        </section>
      )}

      <Footer />

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onUpdate={handleMovieUpdate}
        />
      )}
    </div>
  );
}
