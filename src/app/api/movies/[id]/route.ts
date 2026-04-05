import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;
  const updates = await req.json();

  const fields = [];
  const values = [];
  let idx = 1;

  if (updates.status !== undefined) { fields.push(`status = $${idx++}`); values.push(updates.status); }
  if (updates.rating !== undefined) { fields.push(`rating = $${idx++}`); values.push(updates.rating); }
  if (updates.is_favorite !== undefined) { fields.push(`is_favorite = $${idx++}`); values.push(updates.is_favorite); }

  if (fields.length === 0) return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });

  values.push(id, session.userId);
  const result = await pool.query(
    `UPDATE user_movies SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`,
    values
  );

  if (result.rows.length === 0) return NextResponse.json({ error: 'Film non trouvé' }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;
  await pool.query('DELETE FROM user_movies WHERE id = $1 AND user_id = $2', [id, session.userId]);
  return NextResponse.json({ success: true });
}
