import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;

  const listCheck = await pool.query(
    'SELECT id FROM user_lists WHERE id = $1 AND user_id = $2',
    [id, session.userId],
  );
  if (listCheck.rows.length === 0) return NextResponse.json({ error: 'Liste introuvable' }, { status: 404 });

  const { tmdb_id, media_type, title, poster_path, release_date } = await req.json();
  if (!tmdb_id || !media_type || !title) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });

  const result = await pool.query(
    `INSERT INTO list_movies (list_id, user_id, tmdb_id, media_type, title, poster_path, release_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (list_id, tmdb_id, media_type) DO NOTHING
     RETURNING *`,
    [id, session.userId, tmdb_id, media_type, title, poster_path || null, release_date || null],
  );

  await pool.query('UPDATE user_lists SET updated_at = NOW() WHERE id = $1', [id]);

  return NextResponse.json(result.rows[0] ?? { already_exists: true }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;
  const { tmdb_id, media_type } = await req.json();

  const result = await pool.query(
    `DELETE FROM list_movies
     WHERE list_id = $1 AND user_id = $2 AND tmdb_id = $3 AND media_type = $4`,
    [id, session.userId, tmdb_id, media_type],
  );

  if (result.rowCount === 0) return NextResponse.json({ error: 'Film introuvable dans cette liste' }, { status: 404 });

  await pool.query('UPDATE user_lists SET updated_at = NOW() WHERE id = $1', [id]);

  return NextResponse.json({ success: true });
}
