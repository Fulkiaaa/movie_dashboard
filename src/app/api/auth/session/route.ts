import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  // Vérifie si l'utilisateur a un abonnement actif non expiré
  const result = await pool.query(
    `SELECT EXISTS(
       SELECT 1 FROM subscriptions
       WHERE user_id = $1
         AND plan != 'free'
         AND status IN ('active', 'trialing')
         AND (expires_at IS NULL OR expires_at > NOW())
     ) AS is_pro`,
    [session.userId],
  );

  const is_pro: boolean = result.rows[0]?.is_pro ?? false;

  return NextResponse.json({ user: { id: session.userId, email: session.email, is_pro } });
}
