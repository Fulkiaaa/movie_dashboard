import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { signToken, createAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit faire au moins 8 caractères' }, { status: 400 });
    }

    const dbInfo = await pool.query("SELECT current_database() as db, current_schema() as schema, current_user as usr");
    console.log('[DB INFO]', dbInfo.rows[0]);
    const tableCheck = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('[DB TABLES]', tableCheck.rows);

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, passwordHash]
    );

    const user = result.rows[0];
    const token = signToken({ userId: user.id, email: user.email });
    const cookie = createAuthCookie(token);

    const response = NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });
    response.cookies.set(cookie);
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 });
  }
}
