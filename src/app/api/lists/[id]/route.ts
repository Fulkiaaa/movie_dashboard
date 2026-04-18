import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;

  const [list, movies] = await Promise.all([
    pool.query(
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
       WHERE ul.id = $1 AND ul.user_id = $2
       GROUP BY ul.id`,
      [id, session.userId],
    ),
    pool.query(
      `SELECT * FROM list_movies WHERE list_id = $1 ORDER BY added_at DESC`,
      [id],
    ),
  ]);

  if (list.rows.length === 0) return NextResponse.json({ error: 'Liste introuvable' }, { status: 404 });

  return NextResponse.json({ ...list.rows[0], movies: movies.rows });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const setClauses: string[] = ['updated_at = NOW()'];
  const values: unknown[] = [];
  let idx = 1;

  if (body.name !== undefined) {
    if (!body.name?.trim()) return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    setClauses.push(`name = $${idx++}`);
    values.push(body.name.trim());
  }
  if (body.description !== undefined) {
    setClauses.push(`description = $${idx++}`);
    values.push(body.description?.trim() || null);
  }

  values.push(id, session.userId);
  const result = await pool.query(
    `UPDATE user_lists SET ${setClauses.join(', ')}
     WHERE id = $${idx++} AND user_id = $${idx++}
     RETURNING *`,
    values,
  );

  if (result.rows.length === 0) return NextResponse.json({ error: 'Liste introuvable' }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;
  const result = await pool.query(
    'DELETE FROM user_lists WHERE id = $1 AND user_id = $2',
    [id, session.userId],
  );

  if (result.rowCount === 0) return NextResponse.json({ error: 'Liste introuvable' }, { status: 404 });
  return NextResponse.json({ success: true });
}
