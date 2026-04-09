import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { getSession, clearAuthCookie } from '@/lib/auth';

// PATCH /api/auth/account — Droit de rectification
// Body: { currentPassword, newEmail?, newPassword? }
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { currentPassword, newEmail, newPassword } = await req.json();

  if (!currentPassword) {
    return NextResponse.json({ error: 'Mot de passe actuel requis' }, { status: 400 });
  }
  if (!newEmail && !newPassword) {
    return NextResponse.json({ error: 'Aucune modification fournie' }, { status: 400 });
  }

  // Vérifier le mot de passe actuel
  const userRow = await pool.query('SELECT password_hash FROM users WHERE id = $1', [session.userId]);
  if (userRow.rows.length === 0) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, userRow.rows[0].password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 403 });
  }

  // Construire la mise à jour
  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (newEmail) {
    const dup = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [newEmail, session.userId]);
    if (dup.rows.length > 0) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
    }
    updates.push(`email = $${idx++}`);
    values.push(newEmail);
  }

  if (newPassword) {
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Le nouveau mot de passe doit faire au moins 8 caractères' }, { status: 400 });
    }
    const hash = await bcrypt.hash(newPassword, 12);
    updates.push(`password_hash = $${idx++}`);
    values.push(hash);
  }

  values.push(session.userId);
  await pool.query(
    `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}`,
    values
  );

  return NextResponse.json({ success: true });
}

// DELETE /api/auth/account — Droit à l'effacement
// Body: { password }
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { password } = await req.json();
  if (!password) {
    return NextResponse.json({ error: 'Confirmation par mot de passe requise' }, { status: 400 });
  }

  const userRow = await pool.query('SELECT password_hash FROM users WHERE id = $1', [session.userId]);
  if (userRow.rows.length === 0) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  const valid = await bcrypt.compare(password, userRow.rows[0].password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 403 });
  }

  // Suppression cascade (user_movies et skipped_movies ON DELETE CASCADE)
  await pool.query('DELETE FROM users WHERE id = $1', [session.userId]);

  const response = NextResponse.json({ success: true });
  response.cookies.set(clearAuthCookie());
  return response;
}
