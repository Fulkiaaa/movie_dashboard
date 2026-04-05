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

    const result = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email });
    const cookie = createAuthCookie(token);

    const response = NextResponse.json({ user: { id: user.id, email: user.email } });
    response.cookies.set(cookie);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
  }
}
