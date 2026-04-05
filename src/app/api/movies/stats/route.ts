import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [watched, watchlist, favorites, thisWeek] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM user_movies WHERE user_id = $1 AND status = 'watched'", [session.userId]),
    pool.query("SELECT COUNT(*) FROM user_movies WHERE user_id = $1 AND status = 'watchlist'", [session.userId]),
    pool.query('SELECT COUNT(*) FROM user_movies WHERE user_id = $1 AND rating = 5', [session.userId]),
    pool.query(
      "SELECT COUNT(*) FROM user_movies WHERE user_id = $1 AND status = 'watched' AND created_at >= $2",
      [session.userId, oneWeekAgo.toISOString()]
    ),
  ]);

  return NextResponse.json({
    watched: parseInt(watched.rows[0].count),
    watchlist: parseInt(watchlist.rows[0].count),
    favorites: parseInt(favorites.rows[0].count),
    thisWeek: parseInt(thisWeek.rows[0].count),
  });
}
