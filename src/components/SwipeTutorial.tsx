'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

const TUTORIAL_KEY = 'swipe_tutorial_seen';

export interface SwipeTutorialProps {
  onDismiss: () => void;
}

type Phase = 'rest' | 'going' | 'holding' | 'returning' | 'done';

interface TimelineEntry {
  dirIndex: number;
  phase: Phase;
  duration: number;
}

const DIRECTIONS = [
  {
    label: 'Déjà vu',
    description: 'Glissez vers la droite',
    borderColor: '#6B9472',
    textColor: '#6B9472',
    bgColor: 'rgba(107, 148, 114, 0.15)',
    Arrow: ArrowRight,
  },
  {
    label: 'Pas vu',
    description: 'Glissez vers la gauche',
    borderColor: '#E4DED2',
    textColor: '#F6F4F1',
    bgColor: 'rgba(228, 222, 210, 0.15)',
    Arrow: ArrowLeft,
  },
  {
    label: 'À voir',
    description: 'Glissez vers le haut',
    borderColor: '#B8B0A0',
    textColor: '#B8B0A0',
    bgColor: 'rgba(184, 176, 160, 0.15)',
    Arrow: ArrowUp,
  },
] as const;

const TIMELINE: TimelineEntry[] = [
  { dirIndex: 0, phase: 'rest',      duration: 900 },
  { dirIndex: 0, phase: 'going',     duration: 600 },
  { dirIndex: 0, phase: 'holding',   duration: 800 },
  { dirIndex: 0, phase: 'returning', duration: 500 },
  { dirIndex: 1, phase: 'rest',      duration: 500 },
  { dirIndex: 1, phase: 'going',     duration: 600 },
  { dirIndex: 1, phase: 'holding',   duration: 800 },
  { dirIndex: 1, phase: 'returning', duration: 500 },
  { dirIndex: 2, phase: 'rest',      duration: 500 },
  { dirIndex: 2, phase: 'going',     duration: 600 },
  { dirIndex: 2, phase: 'holding',   duration: 800 },
  { dirIndex: 2, phase: 'returning', duration: 500 },
  { dirIndex: 2, phase: 'done',      duration: 1400 },
];

function getCardTransform(phase: Phase, dirIndex: number): string {
  if (phase !== 'going' && phase !== 'holding') {
    return 'translate(0px, 0px) rotate(0deg)';
  }
  switch (dirIndex) {
    case 0: return 'translate(185px, 18px) rotate(22deg)';
    case 1: return 'translate(-185px, 18px) rotate(-22deg)';
    case 2: return 'translate(0px, -195px) rotate(0deg)';
    default: return 'translate(0px, 0px) rotate(0deg)';
  }
}

function getCardTransition(phase: Phase): string {
  if (phase === 'returning') return 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
  if (phase === 'going')     return 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  return 'transform 0.3s ease-out';
}

function getLabelPosition(dirIndex: number): React.CSSProperties {
  if (dirIndex === 0) return { right: 8, top: '50%', transform: 'translateY(-50%) rotate(-20deg)' };
  if (dirIndex === 1) return { left: 8,  top: '50%', transform: 'translateY(-50%) rotate(20deg)' };
  return { top: 10, left: '50%', transform: 'translateX(-50%)' };
}

export default function SwipeTutorial({ onDismiss }: SwipeTutorialProps) {
  const [tlIndex, setTlIndex] = useState(0);

  const dismiss = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TUTORIAL_KEY, '1');
    }
    onDismiss();
  }, [onDismiss]);

  // Advance timeline
  useEffect(() => {
    if (tlIndex >= TIMELINE.length) {
      dismiss();
      return;
    }
    const entry = TIMELINE[tlIndex];
    const timer = setTimeout(() => {
      if (entry.phase === 'done') {
        dismiss();
      } else {
        setTlIndex(i => i + 1);
      }
    }, entry.duration);
    return () => clearTimeout(timer);
  }, [tlIndex, dismiss]);

  // Dismiss on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dismiss]);

  const safeIndex = Math.min(tlIndex, TIMELINE.length - 1);
  const { dirIndex, phase } = TIMELINE[safeIndex];
  const direction = DIRECTIONS[dirIndex];
  const { Arrow } = direction;

  const showLabel  = phase === 'going' || phase === 'holding';
  const isDone     = phase === 'done';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.68)', backdropFilter: 'blur(4px)' }}
      onClick={dismiss}
    >
      {/* Skip button — fixed top-right, always visible */}
      <button
        onClick={dismiss}
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          fontSize: 13,
          fontWeight: 600,
          color: '#0D0D0D',
          background: '#F6F4F1',
          border: 'none',
          cursor: 'pointer',
          padding: '7px 16px',
          borderRadius: 8,
          transition: 'background 0.15s ease',
          zIndex: 51,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#EBE7E0';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#F6F4F1';
        }}
      >
        Passer
      </button>

      <div
        className="flex flex-col items-center"
        style={{ gap: 28 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Title + instruction */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#F6F4F1', fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>
            Comment swiper ?
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              color: isDone ? '#D4A843' : direction.textColor,
              fontSize: 14,
              fontWeight: 500,
              transition: 'color 0.3s ease',
            }}
          >
            {!isDone && <Arrow size={16} />}
            <span>{isDone ? 'Vous êtes prêt !' : direction.description}</span>
          </div>
        </div>

        {/* Animated card zone — overflow visible intentionally */}
        <div style={{ position: 'relative', width: 160, height: 240 }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 160,
              height: 240,
              transform: getCardTransform(phase, dirIndex),
              transition: getCardTransition(phase),
              borderRadius: 16,
              background: '#151515',
              boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            {/* Poster placeholder */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              {/* Gradient lines mimicking a poster */}
              <div style={{ width: 56, height: 72, borderRadius: 6, background: 'rgba(246,244,241,0.08)' }} />
              <div style={{ width: 72, height: 5, borderRadius: 3, background: 'rgba(246,244,241,0.12)' }} />
              <div style={{ width: 48, height: 4, borderRadius: 2, background: 'rgba(246,244,241,0.07)' }} />
            </div>

            {/* Direction label */}
            <div
              style={{
                position: 'absolute',
                ...getLabelPosition(dirIndex),
                opacity: showLabel ? 1 : 0,
                transition: 'opacity 0.22s ease',
                padding: '4px 10px',
                borderRadius: 999,
                border: `2px solid ${direction.borderColor}`,
                background: direction.bgColor,
                color: direction.textColor,
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              {direction.label}
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {DIRECTIONS.map((_, i) => (
            <div
              key={i}
              style={{
                height: 8,
                width: i === dirIndex ? 24 : 8,
                borderRadius: 4,
                background: i === dirIndex ? '#D4A843' : 'rgba(246, 244, 241, 0.25)',
                transition: 'all 0.35s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
