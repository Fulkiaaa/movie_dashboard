'use client';

import { useRef, useState } from 'react';
import { Star } from 'lucide-react';

interface HalfStarRatingProps {
  value: number | null;
  onChange: (rating: number | null) => void;
  /** 'light' = fond clair (Paper), 'dark' = fond sombre (overlay swipe) */
  variant?: 'light' | 'dark';
  starSize?: string;
  showLabel?: boolean;
}

export default function HalfStarRating({
  value,
  onChange,
  variant = 'light',
  starSize = 'w-7 h-7 md:w-8 md:h-8',
  showLabel = true,
}: HalfStarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const display = hovered ?? value;

  const emptyClass = variant === 'dark' ? 'text-white/30' : 'text-[#B8B0A0]';
  const filledClass = 'fill-[#D4A843] text-[#D4A843]';

  /** Calcule la note (par pas de 0.5) depuis la position X du doigt */
  const ratingFromX = (clientX: number): number => {
    if (!containerRef.current) return 0.5;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(5, Math.max(0.5, Math.round(ratio * 5 * 2) / 2));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setHovered(ratingFromX(e.touches[0].clientX));
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setHovered(ratingFromX(e.touches[0].clientX));
  };

  const onTouchEnd = () => {
    if (hovered !== null) {
      onChange(hovered === value ? null : hovered);
    }
    setHovered(null);
  };

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <div
        ref={containerRef}
        className="flex gap-0.5 md:gap-1"
        style={{ touchAction: 'none' }}
        onMouseLeave={() => setHovered(null)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = display !== null && display >= star;
          const isHalf = display !== null && display >= star - 0.5 && display < star;

          return (
            <div
              key={star}
              className={`relative ${starSize} cursor-pointer select-none`}
            >
              {/* Étoile vide (fond) */}
              <Star className={`absolute inset-0 ${starSize} ${emptyClass}`} />

              {/* Demi-étoile — clip sur la moitié gauche */}
              {isHalf && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star className={`${starSize} ${filledClass}`} />
                </div>
              )}

              {/* Étoile pleine */}
              {isFull && (
                <Star className={`absolute inset-0 ${starSize} ${filledClass}`} />
              )}

              {/* Zones cliquables souris — gauche demi, droite pleine */}
              <div
                className="absolute inset-y-0 left-0 w-1/2"
                onMouseEnter={() => setHovered(star - 0.5)}
                onClick={() => onChange(value === star - 0.5 ? null : star - 0.5)}
              />
              <div
                className="absolute inset-y-0 right-0 w-1/2"
                onMouseEnter={() => setHovered(star)}
                onClick={() => onChange(value === star ? null : star)}
              />
            </div>
          );
        })}
      </div>

      {showLabel && (
        <span className={`text-sm font-medium min-w-10 ${variant === 'dark' ? 'text-white' : 'text-[#0D0D0D]'}`}>
          {display !== null ? `${display}/5` : '—'}
        </span>
      )}
    </div>
  );
}
