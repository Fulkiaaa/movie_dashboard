'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface TestResult {
  status: Status;
  message: string;
  detail?: string;
}

export default function TestPage() {
  const [tmdb, setTmdb] = useState<TestResult>({ status: 'idle', message: 'Non testé' });
  const [supabase, setSupabase] = useState<TestResult>({ status: 'idle', message: 'Non testé' });
  const [tmdbMovie, setTmdbMovie] = useState<{ title: string; year: string; rating: string } | null>(null);

  const testTMDB = async () => {
    setTmdb({ status: 'loading', message: 'Test en cours...' });
    setTmdbMovie(null);
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';

      if (!apiKey || apiKey === 'your_tmdb_api_key_here') {
        setTmdb({ status: 'error', message: 'Clé API TMDB non configurée', detail: 'Vérifiez NEXT_PUBLIC_TMDB_API_KEY dans .env.local' });
        return;
      }

      // On récupère un film connu (Inception id=27205) — simple GET, aucun effet de bord
      const res = await fetch(`${baseUrl}/movie/27205?api_key=${apiKey}&language=fr-FR`);

      if (res.ok) {
        const data = await res.json();
        setTmdbMovie({
          title: data.title,
          year: data.release_date?.split('-')[0] ?? '?',
          rating: data.vote_average?.toFixed(1) ?? '?',
        });
        setTmdb({ status: 'success', message: 'Connexion réussie', detail: `Film récupéré : "${data.title}"` });
      } else {
        const err = await res.json().catch(() => ({}));
        setTmdb({ status: 'error', message: `Erreur HTTP ${res.status}`, detail: err.status_message ?? 'Vérifiez votre clé API' });
      }
    } catch (e: any) {
      setTmdb({ status: 'error', message: 'Erreur réseau', detail: e?.message });
    }
  };

  const testSupabase = async () => {
    setSupabase({ status: 'loading', message: 'Test en cours...' });
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || url === 'your_supabase_url_here' || !key || key === 'your_supabase_publishable_key_here') {
        setSupabase({ status: 'error', message: 'Credentials Supabase non configurées', detail: 'Vérifiez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY' });
        return;
      }

      // On interroge la vue système `pg_tables` via PostgREST — lecture seule, toujours accessible
      // On limite à 1 ligne pour que ce soit rapide
      const res = await fetch(`${url}/rest/v1/rpc/version`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      // pg version() est une fonction built-in Supabase toujours disponible
      if (res.ok) {
        const text = await res.text();
        setSupabase({ status: 'success', message: 'Connexion réussie', detail: `PostgreSQL : ${text.replace(/"/g, '')}` });
      } else if (res.status === 401 || res.status === 403) {
        // Auth échouée = mauvaise clé, pas un problème réseau
        setSupabase({ status: 'error', message: `Authentification refusée (${res.status})`, detail: 'Vérifiez votre SUPABASE_PUBLISHABLE_KEY (anon key)' });
      } else if (res.status === 404) {
        // La fonction version() n'existe pas (rare) → on retombe sur un ping HTTP simple
        const ping = await fetch(`${url}/rest/v1/`, { headers: { apikey: key } });
        // 200 ou 400 = le serveur répond = connexion OK
        if (ping.status < 500) {
          setSupabase({ status: 'success', message: 'Connexion réussie', detail: 'Serveur Supabase joignable et authentifié' });
        } else {
          setSupabase({ status: 'error', message: `Erreur serveur ${ping.status}`, detail: 'Supabase a retourné une erreur 5xx' });
        }
      } else {
        setSupabase({ status: 'error', message: `Erreur inattendue ${res.status}`, detail: await res.text().catch(() => '') });
      }
    } catch (e: any) {
      setSupabase({ status: 'error', message: 'Erreur réseau', detail: e?.message });
    }
  };

  const StatusBadge = ({ status }: { status: Status }) => {
    const map: Record<Status, { bg: string; dot: string; label: string }> = {
      idle:    { bg: 'bg-slate-700', dot: 'bg-slate-400', label: 'En attente' },
      loading: { bg: 'bg-yellow-900/40', dot: 'bg-yellow-400 animate-pulse', label: 'En cours…' },
      success: { bg: 'bg-emerald-900/40', dot: 'bg-emerald-400', label: 'OK' },
      error:   { bg: 'bg-red-900/40',  dot: 'bg-red-400',  label: 'Erreur' },
    };
    const s = map[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold ${s.bg}`}>
        <span className={`w-2 h-2 rounded-full ${s.dot}`} />
        {s.label}
      </span>
    );
  };

  const Card = ({
    icon, title, color, result, movie, onTest,
  }: {
    icon: string;
    title: string;
    color: string;
    result: TestResult;
    movie?: { title: string; year: string; rating: string } | null;
    onTest: () => void;
  }) => (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h2 className="text-lg font-bold text-white font-mono">{title}</h2>
            <StatusBadge status={result.status} />
          </div>
        </div>
        <button
          onClick={onTest}
          disabled={result.status === 'loading'}
          className={`px-5 py-2 rounded-xl text-sm font-bold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
        >
          {result.status === 'loading' ? '…' : 'Tester'}
        </button>
      </div>

      {/* Message principal */}
      <div className={`rounded-xl p-4 font-mono text-sm border ${
        result.status === 'success' ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300' :
        result.status === 'error'   ? 'bg-red-950/50 border-red-800 text-red-300' :
        result.status === 'loading' ? 'bg-yellow-950/50 border-yellow-800 text-yellow-300' :
        'bg-gray-800 border-gray-700 text-gray-400'
      }`}>
        <p className="font-semibold">{result.message}</p>
        {result.detail && <p className="mt-1 text-xs opacity-75">{result.detail}</p>}
      </div>

      {/* Bonus : aperçu film TMDB */}
      {movie && (
        <div className="mt-4 flex items-center gap-3 bg-gray-800 rounded-xl p-3">
          <span className="text-3xl">🎬</span>
          <div>
            <p className="text-white font-semibold">{movie.title} <span className="text-gray-400 font-normal">({movie.year})</span></p>
            <p className="text-yellow-400 text-sm">⭐ {movie.rating} / 10</p>
          </div>
        </div>
      )}
    </div>
  );

  // Env vars summary
  const envVars = [
    { key: 'NEXT_PUBLIC_TMDB_API_KEY', val: process.env.NEXT_PUBLIC_TMDB_API_KEY },
    { key: 'NEXT_PUBLIC_TMDB_BASE_URL', val: process.env.NEXT_PUBLIC_TMDB_BASE_URL },
    { key: 'NEXT_PUBLIC_SUPABASE_URL', val: process.env.NEXT_PUBLIC_SUPABASE_URL },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', val: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Diagnostic</p>
          <h1 className="text-3xl font-bold tracking-tight">🔧 Test de connexion</h1>
          <p className="text-gray-400 text-sm mt-2">Vérifie les APIs sans créer de données ni modifier quoi que ce soit.</p>
        </div>

        {/* Env vars */}
        <div className="mb-8 bg-gray-900 border border-gray-700 rounded-2xl p-5">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Variables d'environnement</h2>
          <div className="space-y-2">
            {envVars.map(({ key, val }) => {
              const configured = !!val && !val.includes('your_') && val.length > 8;
              return (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{key}</span>
                  <span className={configured ? 'text-emerald-400' : 'text-red-400'}>
                    {configured ? `✓ ${val!.slice(0, 6)}…` : '✗ Non définie'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-6">
          <Card
            icon="🎬"
            title="TMDB API"
            color="bg-red-600 hover:bg-red-500"
            result={tmdb}
            movie={tmdbMovie}
            onTest={testTMDB}
          />
          <Card
            icon="🗄️"
            title="Supabase"
            color="bg-emerald-600 hover:bg-emerald-500"
            result={supabase}
            onTest={testSupabase}
          />
        </div>

        {/* Méthodes utilisées */}
        <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-2xl p-5 text-xs text-gray-500 space-y-2">
          <p className="font-semibold text-gray-400 uppercase tracking-widest">Comment ça marche</p>
          <p>🎬 <strong className="text-gray-300">TMDB</strong> — GET sur un film connu (Inception). Lecture seule, aucun effet de bord.</p>
          <p>🗄️ <strong className="text-gray-300">Supabase</strong> — Appel à <code className="bg-gray-800 px-1 rounded">rpc/version()</code>, fonction PostgreSQL built-in. Pas de table créée, pas de données modifiées.</p>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-400 hover:text-blue-300 text-sm underline">← Retour à l'accueil</a>
        </div>
      </div>
    </div>
  );
}