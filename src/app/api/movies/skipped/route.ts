import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const result = await pool.query(
    'SELECT tmdb_id FROM skipped_movies WHERE user_id = $1',
    [session.userId]
  );
  return NextResponse.json(result.rows.map((r) => r.tmdb_id));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { tmdb_id, media_type } = await req.json();

  await pool.query(
    'INSERT INTO skipped_movies (user_id, tmdb_id, media_type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
    [session.userId, tmdb_id, media_type]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { tmdb_id, media_type } = await req.json();

  await pool.query(
    'DELETE FROM skipped_movies WHERE user_id = $1 AND tmdb_id = $2 AND media_type = $3',
    [session.userId, tmdb_id, media_type]
  );
  return NextResponse.json({ success: true });
}
