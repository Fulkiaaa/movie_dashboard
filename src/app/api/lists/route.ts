import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const result = await pool.query(
    `SELECT
       ul.*,
       COUNT(lm.id)::int AS movie_count,
       COALESCE(
         ARRAY_AGG(lm.poster_path ORDER BY lm.added_at DESC)
           FILTER (WHERE lm.poster_path IS NOT NULL),
         ARRAY[]::text[]
       ) AS preview_posters
     FROM user_lists ul
     LEFT JOIN list_movies lm ON lm.list_id = ul.id
     WHERE ul.user_id = $1
     GROUP BY ul.id
     ORDER BY ul.updated_at DESC`,
    [session.userId],
  );

  return NextResponse.json(
    result.rows.map(row => ({ ...row, preview_posters: row.preview_posters.slice(0, 4) })),
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { name, description } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
  if (name.trim().length > 100) return NextResponse.json({ error: 'Nom trop long (100 car. max)' }, { status: 400 });

  const result = await pool.query(
    `INSERT INTO user_lists (user_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING *, 0 AS movie_count, ARRAY[]::text[] AS preview_posters`,
    [session.userId, name.trim(), description?.trim() || null],
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
