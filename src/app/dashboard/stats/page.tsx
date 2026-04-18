'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Film, Star, TrendingUp, Calendar, Crown } from 'lucide-react';
import ProGate from '@/components/ProGate';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeatmapDay   { date: string; count: number }
interface MonthData    { month: string; count: number }
interface DecadeData   { decade: number; count: number }
interface RatingPoint  { month: string; avgRating: number; count: number }

interface AdvancedStats {
  watched: number;
  watchlist: number;
  avgRating: number | null;
  thisWeek: number;
  thisMonth: number;
  heatmap: HeatmapDay[];
  byMonth: MonthData[];
  byDecade: DecadeData[];
  ratingEvolution: RatingPoint[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];

function cellStyle(count: number): React.CSSProperties {
  if (count === 0) return { backgroundColor: '#E4DED2' };
  const opacity = Math.min(0.25 + count * 0.22, 1);
  return { backgroundColor: `rgba(249, 92, 75, ${opacity})` };
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────

function Heatmap({ data }: { data: HeatmapDay[] }) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Start on Monday ~52 weeks ago
  const start = new Date(today);
  start.setDate(today.getDate() - 363);
  const dow = start.getDay();
  start.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1));

  const lookup: Record<string, number> = {};
  data.forEach(d => { lookup[d.date] = d.count; });

  // Build weeks
  type Cell = { date: string; count: number; isToday: boolean };
  type Week = { days: Cell[]; monthLabel?: string };
  const weeks: Week[] = [];
  const cursor = new Date(start);

  while (cursor <= today) {
    const days: Cell[] = [];
    let monthLabel: string | undefined;

    for (let d = 0; d < 7; d++) {
      if (cursor > today) break;
      const dateStr = cursor.toISOString().split('T')[0];
      if (d === 0) {
        const m = cursor.getMonth();
        const prev = weeks.length > 0 ? new Date(weeks[weeks.length - 1].days[0].date).getMonth() : -1;
        if (weeks.length === 0 || prev !== m) monthLabel = MONTH_FR[m];
      }
      days.push({ date: dateStr, count: lookup[dateStr] || 0, isToday: dateStr === todayStr });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push({ days, monthLabel });
  }

  const totalFilms = data.reduce((s, d) => s + d.count, 0);
  const maxDay     = Math.max(...data.map(d => d.count), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#0D0D0D]">Activité sur 52 semaines</h2>
          <p className="text-sm text-[#B8B0A0] mt-0.5">{totalFilms} film{totalFilms !== 1 ? 's' : ''} enregistrés · record&nbsp;: {maxDay}/jour</p>
        </div>
        {/* Legend */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#B8B0A0]">
          <span>Moins</span>
          {[0, 1, 2, 3, 4].map(v => (
            <div key={v} className="w-3 h-3 rounded-sm" style={cellStyle(v)} />
          ))}
          <span>Plus</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1.5 min-w-max">
          {/* Day labels */}
          <div className="flex flex-col gap-1.5 pt-5 mr-0.5">
            {['L', '', 'M', '', 'J', '', 'S'].map((lbl, i) => (
              <div key={i} className="w-3 h-3 text-[9px] text-[#B8B0A0] flex items-center justify-end">
                {lbl}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col">
              <div className="h-5 text-[9px] text-[#B8B0A0] flex items-end pb-0.5 whitespace-nowrap">
                {week.monthLabel ?? ''}
              </div>
              <div className="flex flex-col gap-1.5">
                {week.days.map((cell, di) => (
                  <div
                    key={di}
                    className="w-3 h-3 rounded-sm cursor-default transition-opacity hover:opacity-70"
                    style={{
                      ...cellStyle(cell.count),
                      outline: cell.isToday ? '1.5px solid #0D0D0D' : undefined,
                    }}
                    title={`${cell.date} · ${cell.count} film${cell.count !== 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Decade chart (horizontal bars) ──────────────────────────────────────────

function DecadeChart({ data }: { data: DecadeData[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div>
      <h2 className="text-lg font-bold text-[#0D0D0D] mb-1">Par décennie</h2>
      <p className="text-sm text-[#B8B0A0] mb-4">Années de sortie de vos films</p>
      {data.length === 0 ? (
        <p className="text-sm text-[#B8B0A0] py-4 text-center">Pas encore de données</p>
      ) : (
        <div className="space-y-2.5">
          {data.map(d => (
            <div key={d.decade} className="flex items-center gap-3">
              <span className="text-xs text-[#B8B0A0] w-12 shrink-0 text-right">{d.decade}s</span>
              <div className="flex-1 bg-[#E4DED2] rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(d.count / max) * 100}%`, backgroundColor: '#F95C4B' }}
                />
              </div>
              <span className="text-xs font-medium text-[#0D0D0D] w-6 shrink-0">{d.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Monthly chart (vertical bars) ───────────────────────────────────────────

function MonthlyChart({ data }: { data: MonthData[] }) {
  const max = Math.max(...data.map(d => d.count), 1);

  const label = (month: string) => {
    const [, m] = month.split('-');
    return MONTH_FR[parseInt(m, 10) - 1];
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-[#0D0D0D] mb-1">Films par mois</h2>
      <p className="text-sm text-[#B8B0A0] mb-4">12 derniers mois</p>
      {data.length === 0 ? (
        <p className="text-sm text-[#B8B0A0] py-4 text-center">Pas encore de données</p>
      ) : (
        <div className="flex items-end gap-1.5 h-28">
          {data.map(d => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-[#B8B0A0]">{d.count > 0 ? d.count : ''}</span>
              <div className="w-full rounded-t-sm transition-all duration-500" style={{
                height: `${Math.max((d.count / max) * 80, d.count > 0 ? 4 : 0)}px`,
                backgroundColor: '#F95C4B',
              }} />
              <span className="text-[9px] text-[#B8B0A0]">{label(d.month)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rating evolution (SVG line chart) ───────────────────────────────────────

function RatingChart({ data }: { data: RatingPoint[] }) {
  const label = (month: string) => {
    const [, m] = month.split('-');
    return MONTH_FR[parseInt(m, 10) - 1];
  };

  const W = 640; const H = 90;
  const padL = 24; const padR = 12; const padT = 8; const padB = 20;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const toX = (i: number) => padL + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2);
  const toY = (v: number) => padT + chartH - (v / 5) * chartH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.avgRating)}`).join(' ');
  const area   = data.length > 0
    ? `M${toX(0)},${toY(data[0].avgRating)} ${data.slice(1).map((d, i) => `L${toX(i + 1)},${toY(d.avgRating)}`).join(' ')} L${toX(data.length - 1)},${padT + chartH} L${toX(0)},${padT + chartH} Z`
    : '';

  return (
    <div>
      <h2 className="text-lg font-bold text-[#0D0D0D] mb-1">Évolution de vos notes</h2>
      <p className="text-sm text-[#B8B0A0] mb-4">Moyenne mensuelle sur 12 mois</p>
      {data.length < 2 ? (
        <p className="text-sm text-[#B8B0A0] py-4 text-center">
          {data.length === 0 ? 'Aucune note enregistrée' : 'Pas assez de données pour afficher la courbe'}
        </p>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 110 }}>
          {/* Y grid lines */}
          {[1, 2, 3, 4, 5].map(v => (
            <g key={v}>
              <line x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)} stroke="#E4DED2" strokeWidth={0.8} />
              <text x={padL - 4} y={toY(v)} fontSize={8} fill="#B8B0A0" textAnchor="end" dominantBaseline="middle">{v}</text>
            </g>
          ))}
          {/* Area fill */}
          <path d={area} fill="rgba(249,92,75,0.08)" />
          {/* Line */}
          <polyline points={points} fill="none" stroke="#F95C4B" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          {/* Dots */}
          {data.map((d, i) => (
            <circle key={i} cx={toX(i)} cy={toY(d.avgRating)} r={3} fill="#F95C4B" stroke="#F6F4F1" strokeWidth={1.2}>
              <title>{`${d.month} · ${d.avgRating}/5 (${d.count} films)`}</title>
            </circle>
          ))}
          {/* X labels */}
          {data.map((d, i) => (
            <text key={i} x={toX(i)} y={H - 2} fontSize={8} fill="#B8B0A0" textAnchor="middle">
              {label(d.month)}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
}

// ─── Stat card (free section) ─────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string;
}) {
  return (
    <div className="glass-warm rounded-2xl p-5 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-[#B8B0A0] mb-1">{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className="text-3xl font-bold text-[#0D0D0D] leading-none">{value}</p>
      {sub && <p className="text-xs text-[#B8B0A0]">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<AdvancedStats | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    fetch('/api/movies/stats/advanced')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F95C4B]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-[#B8B0A0] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#0D0D0D] mb-2">Connexion requise</h1>
          <Link href="/auth/login" className="px-6 py-3 bg-[#F95C4B] text-[#F6F4F1] rounded-lg hover:bg-[#C7392A] transition-colors inline-block">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const Skeleton = () => (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="h-6 bg-[#E4DED2] rounded-lg" />)}
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-7xl">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-[#0D0D0D] mb-1">Statistiques</h1>
            <p className="text-sm md:text-base text-[#B8B0A0]">Votre activité cinématographique en chiffres</p>
          </div>
          {user.is_pro && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: '#F5E6C4', color: '#8C6D2A' }}>
              <Crown className="w-3.5 h-3.5" />
              Pro
            </div>
          )}
        </div>

        {/* Free stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {fetching || !stats ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-warm rounded-2xl p-5 h-28 animate-pulse bg-[#EBE7E0]" />
            ))
          ) : (
            <>
              <StatCard icon={<Film className="w-4 h-4" />}     label="Films vus"      value={stats.watched}                                   sub={`${stats.watchlist} en watchlist`} />
              <StatCard icon={<Star className="w-4 h-4" />}     label="Note moyenne"   value={stats.avgRating ? `${stats.avgRating}/5` : '—'}   sub="sur les films notés" />
              <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Cette semaine" value={stats.thisWeek}                                  sub={`${stats.thisMonth} ce mois`} />
              <StatCard icon={<Calendar className="w-4 h-4" />}  label="Ce mois"        value={stats.thisMonth}                                 sub="films enregistrés" />
            </>
          )}
        </div>

        {/* Pro section */}
        <ProGate>
          {/* Heatmap */}
          <div className="glass-warm rounded-2xl p-4 md:p-6 mb-6">
            {fetching || !stats ? <Skeleton /> : <Heatmap data={stats.heatmap} />}
          </div>

          {/* Decade + Monthly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div className="glass-warm rounded-2xl p-4 md:p-6">
              {fetching || !stats ? <Skeleton /> : <DecadeChart data={stats.byDecade} />}
            </div>
            <div className="glass-warm rounded-2xl p-4 md:p-6">
              {fetching || !stats ? <Skeleton /> : <MonthlyChart data={stats.byMonth} />}
            </div>
          </div>

          {/* Rating evolution */}
          <div className="glass-warm rounded-2xl p-4 md:p-6">
            {fetching || !stats ? <Skeleton /> : <RatingChart data={stats.ratingEvolution} />}
          </div>
        </ProGate>

      </div>
    </div>
  );
}
