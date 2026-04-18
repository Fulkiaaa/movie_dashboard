import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tmdb_id = searchParams.get('tmdb_id');
  const media_type = searchParams.get('media_type');

  if (!tmdb_id || !media_type) return NextResponse.json([]);

  const result = await pool.query(
    `SELECT list_id FROM list_movies
     WHERE user_id = $1 AND tmdb_id = $2 AND media_type = $3`,
    [session.userId, parseInt(tmdb_id), media_type],
  );

  return NextResponse.json(result.rows.map(r => r.list_id));
}
