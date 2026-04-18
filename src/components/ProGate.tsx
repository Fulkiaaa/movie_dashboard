'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Crown, Zap } from 'lucide-react';

const PRO_FEATURES = [
  'Heatmap d\'activité sur 52 semaines',
  'Répartition de vos films par décennie',
  'Évolution de vos notes dans le temps',
  'Activité mensuelle détaillée',
];

interface ProGateProps {
  children: React.ReactNode;
}

export default function ProGate({ children }: ProGateProps) {
  const { user } = useAuth();

  if (user?.is_pro) return <>{children}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Blurred preview */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
        <div
          className="glass-warm rounded-2xl p-7 max-w-sm w-full text-center"
          style={{ boxShadow: '0 8px 32px rgba(13,13,13,0.14)' }}
        >
          {/* Crown icon */}
          <div className="w-13 h-13 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: '#D4A843', width: 52, height: 52 }}
          >
            <Crown className="w-6 h-6" style={{ color: '#F6F4F1' }} />
          </div>

          <h3 className="text-base font-bold text-[#0D0D0D] mb-1">Fonctionnalité Pro</h3>
          <p className="text-sm text-[#B8B0A0] mb-5 leading-relaxed">
            Débloquez l&apos;analyse avancée de votre cinémathèque personnelle.
          </p>

          <ul className="space-y-2 text-left mb-6">
            {PRO_FEATURES.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: '#D4A843' }} />
                {f}
              </li>
            ))}
          </ul>

          <button
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={{ background: '#D4A843', color: '#F6F4F1' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#8C6D2A')}
            onMouseLeave={e => (e.currentTarget.style.background = '#D4A843')}
          >
            Passer à SeenIt Pro
          </button>
          <p className="text-xs text-[#B8B0A0] mt-3">Bientôt disponible</p>
        </div>
      </div>
    </div>
  );
}
