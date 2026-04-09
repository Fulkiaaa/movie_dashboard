import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/gdpr/preferences — Lire les préférences RGPD
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const result = await pool.query(
    'SELECT gdpr_restrict_processing, gdpr_opt_out_automated FROM users WHERE id = $1',
    [session.userId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  return NextResponse.json({
    restrict_processing: result.rows[0].gdpr_restrict_processing,
    opt_out_automated: result.rows[0].gdpr_opt_out_automated,
  });
}

// PATCH /api/gdpr/preferences — Mettre à jour les préférences RGPD
// Droit à la limitation du traitement + Droit d'opposition + Droit décisions automatisées
// Body: { restrict_processing?: boolean, opt_out_automated?: boolean }
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json();

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (typeof body.restrict_processing === 'boolean') {
    updates.push(`gdpr_restrict_processing = $${idx++}`);
    values.push(body.restrict_processing);
  }

  if (typeof body.opt_out_automated === 'boolean') {
    updates.push(`gdpr_opt_out_automated = $${idx++}`);
    values.push(body.opt_out_automated);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'Aucune préférence à mettre à jour' }, { status: 400 });
  }

  values.push(session.userId);
  await pool.query(
    `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}`,
    values
  );

  return NextResponse.json({ success: true });
}
