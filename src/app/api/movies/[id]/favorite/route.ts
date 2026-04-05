import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;

  const current = await pool.query(
    'SELECT is_favorite FROM user_movies WHERE id = $1 AND user_id = $2',
    [id, session.userId]
  );
  if (current.rows.length === 0) return NextResponse.json({ error: 'Film non trouvé' }, { status: 404 });

  const newFavorite = !current.rows[0].is_favorite;

  try {
    const result = await pool.query(
      'UPDATE user_movies SET is_favorite = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [newFavorite, id, session.userId]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    if (error.message?.includes('10 films favoris maximum')) {
      return NextResponse.json({ error: 'Vous ne pouvez avoir que 10 films favoris maximum' }, { status: 422 });
    }
    throw error;
  }
}
