import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const result = await pool.query(
    'SELECT COUNT(*) FROM user_movies WHERE user_id = $1 AND is_favorite = TRUE',
    [session.userId]
  );
  return NextResponse.json({ count: parseInt(result.rows[0].count) });
}
