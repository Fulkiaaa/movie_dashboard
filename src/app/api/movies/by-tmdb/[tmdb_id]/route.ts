import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ tmdb_id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { tmdb_id } = await params;
  const { searchParams } = new URL(req.url);
  const media_type = searchParams.get('media_type');

  let query = 'SELECT * FROM user_movies WHERE user_id = $1 AND tmdb_id = $2';
  const values: (string | number)[] = [session.userId, parseInt(tmdb_id)];

  if (media_type) {
    query += ' AND media_type = $3';
    values.push(media_type);
  }

  const result = await pool.query(query, values);
  if (result.rows.length === 0) return NextResponse.json(null);
  return NextResponse.json(result.rows[0]);
}
