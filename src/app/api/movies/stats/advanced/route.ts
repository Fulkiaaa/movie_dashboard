import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const uid = session.userId;

  const [summary, heatmap, byMonth, byDecade, ratingEvolution] = await Promise.all([
    pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'watched')                                          AS watched,
        COUNT(*) FILTER (WHERE status = 'watchlist')                                        AS watchlist,
        ROUND(AVG(rating) FILTER (WHERE status = 'watched' AND rating > 0)::numeric, 1)     AS avg_rating,
        COUNT(*) FILTER (WHERE status = 'watched' AND created_at >= NOW() - INTERVAL '7 days')  AS this_week,
        COUNT(*) FILTER (WHERE status = 'watched' AND created_at >= NOW() - INTERVAL '30 days') AS this_month
       FROM user_movies WHERE user_id = $1`,
      [uid],
    ),

    pool.query(
      `SELECT (created_at AT TIME ZONE 'UTC')::date::text AS date, COUNT(*)::int AS count
       FROM user_movies
       WHERE user_id = $1 AND status = 'watched' AND created_at >= NOW() - INTERVAL '364 days'
       GROUP BY 1 ORDER BY 1`,
      [uid],
    ),

    pool.query(
      `SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month, COUNT(*)::int AS count
       FROM user_movies
       WHERE user_id = $1 AND status = 'watched' AND created_at >= NOW() - INTERVAL '12 months'
       GROUP BY 1 ORDER BY 1`,
      [uid],
    ),

    pool.query(
      `SELECT
         (FLOOR(CAST(SUBSTRING(release_date, 1, 4) AS INTEGER) / 10) * 10)::int AS decade,
         COUNT(*)::int AS count
       FROM user_movies
       WHERE user_id = $1
         AND status = 'watched'
         AND release_date IS NOT NULL
         AND release_date ~ '^[0-9]{4}'
         AND CAST(SUBSTRING(release_date, 1, 4) AS INTEGER) BETWEEN 1900 AND 2030
       GROUP BY 1 ORDER BY 1`,
      [uid],
    ),

    pool.query(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', updated_at), 'YYYY-MM') AS month,
         ROUND(AVG(rating)::numeric, 1)                       AS avg_rating,
         COUNT(*)::int                                         AS count
       FROM user_movies
       WHERE user_id = $1
         AND status = 'watched'
         AND rating IS NOT NULL AND rating > 0
         AND updated_at >= NOW() - INTERVAL '12 months'
       GROUP BY 1 ORDER BY 1`,
      [uid],
    ),
  ]);

  const s = summary.rows[0];

  return NextResponse.json({
    watched:         parseInt(s.watched),
    watchlist:       parseInt(s.watchlist),
    avgRating:       s.avg_rating ? parseFloat(s.avg_rating) : null,
    thisWeek:        parseInt(s.this_week),
    thisMonth:       parseInt(s.this_month),
    heatmap:         heatmap.rows,
    byMonth:         byMonth.rows,
    byDecade:        byDecade.rows,
    ratingEvolution: ratingEvolution.rows.map(r => ({
      month:      r.month,
      avgRating:  parseFloat(r.avg_rating),
      count:      r.count,
    })),
  });
}
