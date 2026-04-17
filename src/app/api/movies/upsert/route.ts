import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { tmdb_id, media_type, title, poster_path, release_date, status, rating, comment } = await req.json();

  const result = await pool.query(
    `INSERT INTO user_movies (user_id, tmdb_id, media_type, title, poster_path, release_date, status, rating, comment)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (user_id, tmdb_id, media_type)
     DO UPDATE SET
       status = EXCLUDED.status,
       rating = EXCLUDED.rating,
       comment = COALESCE(EXCLUDED.comment, user_movies.comment),
       updated_at = NOW()
     RETURNING *`,
    [session.userId, tmdb_id, media_type, title, poster_path, release_date, status, rating ?? null, comment ?? null]
  );
  return NextResponse.json(result.rows[0]);
}
