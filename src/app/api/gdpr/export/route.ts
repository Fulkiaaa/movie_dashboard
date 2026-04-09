import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/gdpr/export
// Droit d'accès + Droit à la portabilité
// Retourne toutes les données de l'utilisateur au format JSON
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const [userRow, moviesRow, skippedRow, prefsRow] = await Promise.all([
    pool.query(
      'SELECT id, email, gdpr_consent_date, gdpr_restrict_processing, gdpr_opt_out_automated, created_at FROM users WHERE id = $1',
      [session.userId]
    ),
    pool.query(
      'SELECT tmdb_id, media_type, title, poster_path, release_date, status, rating, is_favorite, created_at, updated_at FROM user_movies WHERE user_id = $1 ORDER BY created_at DESC',
      [session.userId]
    ),
    pool.query(
      'SELECT tmdb_id, media_type, created_at FROM skipped_movies WHERE user_id = $1 ORDER BY created_at DESC',
      [session.userId]
    ),
    pool.query(
      'SELECT gdpr_restrict_processing, gdpr_opt_out_automated FROM users WHERE id = $1',
      [session.userId]
    ),
  ]);

  if (userRow.rows.length === 0) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  const exportData = {
    export_info: {
      generated_at: new Date().toISOString(),
      format_version: '1.0',
      controller: 'SeenIt — clara.morin@lamanu-student.fr',
    },
    account: {
      id: userRow.rows[0].id,
      email: userRow.rows[0].email,
      created_at: userRow.rows[0].created_at,
      gdpr_consent_date: userRow.rows[0].gdpr_consent_date,
    },
    gdpr_preferences: {
      restrict_processing: prefsRow.rows[0]?.gdpr_restrict_processing ?? false,
      opt_out_automated_decisions: prefsRow.rows[0]?.gdpr_opt_out_automated ?? false,
    },
    movies: moviesRow.rows,
    skipped_movies: skippedRow.rows,
    summary: {
      total_movies: moviesRow.rows.length,
      watched: moviesRow.rows.filter((m) => m.status === 'watched').length,
      watchlist: moviesRow.rows.filter((m) => m.status === 'watchlist').length,
      favorites: moviesRow.rows.filter((m) => m.is_favorite).length,
      skipped: skippedRow.rows.length,
    },
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="seenit_data_${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}
