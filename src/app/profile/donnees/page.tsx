'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Eye,
  PencilLine,
  Trash2,
  PauseCircle,
  Download,
  Ban,
  BotOff,
  Info,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  Mail,
} from 'lucide-react';

interface GdprPrefs {
  restrict_processing: boolean;
  opt_out_automated: boolean;
}

type Feedback = { type: 'success' | 'error'; message: string } | null;

function SectionCard({
  icon: Icon,
  iconColor = '#F95C4B',
  title,
  right,
  badge,
  children,
}: {
  icon: React.ElementType;
  iconColor?: string;
  title: string;
  right?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-warm rounded-2xl p-5 md:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${iconColor}18` }}>
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0D0D0D]">{title}</h2>
            {right && <p className="text-xs text-[#B8B0A0] mt-0.5">{right}</p>}
          </div>
        </div>
        {badge && (
          <span className="px-2.5 py-1 bg-[#F5E6C4] text-[#8C6D2A] text-xs font-semibold rounded-full">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={[
            'w-11 h-6 rounded-full transition-colors',
            checked ? 'bg-[#F95C4B]' : 'bg-[#E4DED2]',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
        />
        <div
          className={[
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-[#0D0D0D]">{label}</p>
        {description && <p className="text-xs text-[#B8B0A0] mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

export default function DonneesPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const [prefs, setPrefs] = useState<GdprPrefs>({ restrict_processing: false, opt_out_automated: false });
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Rectification state
  const [showRectif, setShowRectif] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rectifFeedback, setRectifFeedback] = useState<Feedback>(null);
  const [savingRectif, setSavingRectif] = useState(false);

  // Effacement state
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteFeedback, setDeleteFeedback] = useState<Feedback>(null);
  const [deleting, setDeleting] = useState(false);

  const [prefFeedback, setPrefFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!user) return;
    fetch('/api/gdpr/preferences')
      .then((r) => r.json())
      .then((data) => setPrefs(data))
      .catch(() => {})
      .finally(() => setLoadingPrefs(false));
  }, [user]);

  const savePrefs = async (newPrefs: Partial<GdprPrefs>) => {
    setSavingPrefs(true);
    setPrefFeedback(null);
    try {
      const res = await fetch('/api/gdpr/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs),
      });
      if (!res.ok) throw new Error();
      setPrefs((p) => ({ ...p, ...newPrefs }));
      setPrefFeedback({ type: 'success', message: 'Préférence enregistrée.' });
    } catch {
      setPrefFeedback({ type: 'error', message: 'Erreur lors de la sauvegarde.' });
    } finally {
      setSavingPrefs(false);
      setTimeout(() => setPrefFeedback(null), 3000);
    }
  };

  const handleRectification = async (e: React.FormEvent) => {
    e.preventDefault();
    setRectifFeedback(null);
    if (!newEmail && !newPassword) {
      setRectifFeedback({ type: 'error', message: 'Renseignez au moins un champ à modifier.' });
      return;
    }
    setSavingRectif(true);
    try {
      const res = await fetch('/api/auth/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newEmail: newEmail || undefined, newPassword: newPassword || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRectifFeedback({ type: 'success', message: 'Informations mises à jour avec succès.' });
      setCurrentPassword('');
      setNewEmail('');
      setNewPassword('');
    } catch (err: unknown) {
      setRectifFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de la mise à jour.' });
    } finally {
      setSavingRectif(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirm !== 'SUPPRIMER') {
      setDeleteFeedback({ type: 'error', message: 'Veuillez taper SUPPRIMER pour confirmer.' });
      return;
    }
    setDeleting(true);
    setDeleteFeedback(null);
    try {
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await signOut();
      router.push('/');
    } catch (err: unknown) {
      setDeleteFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de la suppression.' });
      setDeleting(false);
    }
  };

  const downloadJSON = () => {
    window.location.href = '/api/gdpr/export';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#E4DED2] border-t-[#F95C4B] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Shield className="w-14 h-14 text-[#B8B0A0] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#0D0D0D] mb-2">Connexion requise</h1>
          <Link href="/auth/login" className="px-5 py-2.5 bg-[#F95C4B] text-white rounded-xl text-sm font-semibold hover:bg-[#C7392A] transition-all">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-10">
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">

        {/* Back */}
        <Link href="/profile" className="inline-flex items-center gap-2 text-[#B8B0A0] hover:text-[#0D0D0D] transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Retour au profil
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-7 h-7 text-[#F95C4B]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#0D0D0D]">Mes données &amp; droits RGPD</h1>
          </div>
          <p className="text-[#B8B0A0] text-sm ml-10">
            Exercez vos droits conformément au Règlement Général sur la Protection des Données.
          </p>
        </div>

        {/* ── Art. 13 — Droit d'être informé ─────────────── */}
        <div className="mb-4">
          <SectionCard icon={Info} iconColor="#D4A843" title="Droit d'être informé" badge="Art. 13 RGPD">
            <p className="text-sm text-[#0D0D0D] mb-3">
              Vous avez le droit de savoir quelles données sont collectées, pourquoi, et pendant combien de temps.
            </p>
            <div className="bg-[#E4DED2] rounded-xl p-4 text-sm text-[#0D0D0D] space-y-1.5 mb-4">
              <p><span className="font-semibold">Responsable :</span> SeenIt — clara.morin@lamanu-student.fr</p>
              <p><span className="font-semibold">Données collectées :</span> Email, collection de films, notes, favoris</p>
              <p><span className="font-semibold">Base légale :</span> Contrat (exécution du service) + Intérêt légitime</p>
              <p><span className="font-semibold">Conservation :</span> Durée du compte + 30 jours après suppression</p>
              <p><span className="font-semibold">Transferts :</span> Aucun transfert hors UE — données locales</p>
            </div>
            <Link
              href="/legal/privacy"
              className="text-sm text-[#C7392A] font-semibold hover:underline"
            >
              Consulter la politique de confidentialité complète →
            </Link>
          </SectionCard>
        </div>

        {/* ── Art. 15 — Droit d'accès + Art. 20 Portabilité ─ */}
        <div className="mb-4">
          <SectionCard icon={Eye} iconColor="#F95C4B" title="Droit d'accès &amp; portabilité" right="Art. 15 &amp; 20 RGPD">
            <p className="text-sm text-[#0D0D0D] mb-4">
              Accédez à l'ensemble de vos données personnelles et téléchargez-les dans un format structuré et lisible par machine.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={downloadJSON}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D0D0D] text-[#F6F4F1] rounded-xl text-sm font-semibold hover:bg-[#2A2A2A] transition-all"
              >
                <Download className="w-4 h-4" />
                Exporter tout (JSON)
              </button>
            </div>
            <p className="text-xs text-[#B8B0A0] mt-3">
              Le fichier JSON contient : compte, films, notes, favoris, films ignorés et préférences RGPD.
            </p>
          </SectionCard>
        </div>

        {/* ── Art. 16 — Droit de rectification ───────────── */}
        <div className="mb-4">
          <SectionCard icon={PencilLine} iconColor="#F95C4B" title="Droit de rectification" right="Art. 16 RGPD">
            <p className="text-sm text-[#0D0D0D] mb-4">
              Corrigez vos informations personnelles si elles sont inexactes ou incomplètes.
            </p>
            <button
              onClick={() => setShowRectif((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-[#C7392A] hover:underline"
            >
              {showRectif ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showRectif ? 'Masquer le formulaire' : 'Modifier email / mot de passe'}
            </button>

            {showRectif && (
              <form onSubmit={handleRectification} className="mt-4 space-y-3 border-t border-[#E4DED2] pt-4">
                <div>
                  <label className="block text-xs font-medium text-[#0D0D0D] mb-1.5">
                    <Lock className="inline w-3.5 h-3.5 mr-1" />Mot de passe actuel (obligatoire)
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F6F4F1] border border-[#B8B0A0] rounded-lg text-sm text-[#0D0D0D] focus:outline-none focus:border-[#F95C4B] transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0D0D0D] mb-1.5">
                    <Mail className="inline w-3.5 h-3.5 mr-1" />Nouvel email (laisser vide pour ne pas changer)
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F6F4F1] border border-[#B8B0A0] rounded-lg text-sm text-[#0D0D0D] focus:outline-none focus:border-[#F95C4B] transition-colors"
                    placeholder="nouveau@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0D0D0D] mb-1.5">
                    <Lock className="inline w-3.5 h-3.5 mr-1" />Nouveau mot de passe (laisser vide pour ne pas changer)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F6F4F1] border border-[#B8B0A0] rounded-lg text-sm text-[#0D0D0D] focus:outline-none focus:border-[#F95C4B] transition-colors"
                    placeholder="••••••••"
                    minLength={8}
                  />
                </div>
                {rectifFeedback && (
                  <Feedback type={rectifFeedback.type} message={rectifFeedback.message} />
                )}
                <button
                  type="submit"
                  disabled={savingRectif}
                  className="px-4 py-2.5 bg-[#F95C4B] text-white rounded-xl text-sm font-semibold hover:bg-[#C7392A] transition-all disabled:opacity-50"
                >
                  {savingRectif ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </form>
            )}
          </SectionCard>
        </div>

        {/* ── Art. 18 — Droit à la limitation ─────────────── */}
        {/* ── Art. 21 — Droit d'opposition ─────────────────── */}
        {/* ── Art. 22 — Décisions automatisées ─────────────── */}
        <div className="mb-4">
          <SectionCard icon={PauseCircle} iconColor="#D4A843" title="Limitation, opposition &amp; décisions automatisées" right="Art. 18, 21 &amp; 22 RGPD">
            <p className="text-sm text-[#0D0D0D] mb-5">
              Contrôlez comment vos données sont utilisées pour les traitements non essentiels.
            </p>

            {loadingPrefs ? (
              <div className="w-6 h-6 rounded-full border-2 border-[#E4DED2] border-t-[#F95C4B] animate-spin" />
            ) : (
              <div className="space-y-5">
                {/* Limitation */}
                <div className="p-4 bg-[#E4DED2] rounded-xl">
                  <p className="text-xs font-bold text-[#B8B0A0] uppercase tracking-wide mb-3">Art. 18 — Limitation du traitement</p>
                  <Toggle
                    checked={prefs.restrict_processing}
                    onChange={(v) => savePrefs({ restrict_processing: v })}
                    disabled={savingPrefs}
                    label="Limiter le traitement de mes données"
                    description="Vos données ne seront utilisées que pour les fonctions essentielles (connexion, affichage). Les statistiques et analyses seront désactivées."
                  />
                </div>

                {/* Opposition + décisions automatisées */}
                <div className="p-4 bg-[#E4DED2] rounded-xl">
                  <p className="text-xs font-bold text-[#B8B0A0] uppercase tracking-wide mb-3">Art. 21 &amp; 22 — Opposition &amp; décisions automatisées</p>
                  <Toggle
                    checked={prefs.opt_out_automated}
                    onChange={(v) => savePrefs({ opt_out_automated: v })}
                    disabled={savingPrefs}
                    label="Désactiver les recommandations personnalisées"
                    description="SeenIt utilise vos films notés pour générer des recommandations automatiquement. Désactiver cette option remplace les recommandations par les films les mieux notés généraux."
                  />
                </div>

                {prefFeedback && (
                  <Feedback type={prefFeedback.type} message={prefFeedback.message} />
                )}

                <div className="p-3 bg-[#F5E6C4] rounded-lg border border-[#D4A843]/30">
                  <p className="text-xs text-[#8C6D2A]">
                    <strong>Art. 22 :</strong> Aucune décision ayant des effets juridiques ou similaires n'est prise de manière entièrement automatisée sur SeenIt. Les recommandations sont des suggestions, jamais des décisions contraignantes.
                  </p>
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Art. 17 — Droit à l'effacement ──────────────── */}
        <div className="mb-4">
          <SectionCard icon={Trash2} iconColor="#C7392A" title="Droit à l'effacement (droit à l'oubli)" right="Art. 17 RGPD">
            <p className="text-sm text-[#0D0D0D] mb-4">
              Supprimez définitivement votre compte et toutes les données associées. Cette action est <strong>irréversible</strong>.
            </p>
            <p className="text-xs text-[#B8B0A0] mb-4">
              Données supprimées : compte, tous vos films, notes, favoris, films ignorés. L'email est libéré immédiatement.
            </p>

            <button
              onClick={() => setShowDelete((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-[#C7392A] hover:underline"
            >
              {showDelete ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showDelete ? 'Annuler' : 'Supprimer mon compte'}
            </button>

            {showDelete && (
              <form onSubmit={handleDeleteAccount} className="mt-4 space-y-3 border-t border-[#FDE8E5] pt-4">
                <div className="p-3 bg-[#FDE8E5] rounded-lg border border-[#F95C4B]/30">
                  <p className="text-sm text-[#C7392A] font-semibold mb-1">⚠ Action irréversible</p>
                  <p className="text-xs text-[#C7392A]">
                    Tous vos films, notes et favoris seront supprimés définitivement. Pensez à exporter vos données avant.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0D0D0D] mb-1.5">
                    <Lock className="inline w-3.5 h-3.5 mr-1" />Confirmez votre mot de passe
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F6F4F1] border border-[#F95C4B] rounded-lg text-sm text-[#0D0D0D] focus:outline-none focus:border-[#C7392A] transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0D0D0D] mb-1.5">
                    Tapez <strong>SUPPRIMER</strong> pour confirmer
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F6F4F1] border border-[#F95C4B] rounded-lg text-sm text-[#0D0D0D] focus:outline-none focus:border-[#C7392A] transition-colors"
                    placeholder="SUPPRIMER"
                    required
                  />
                </div>
                {deleteFeedback && (
                  <Feedback type={deleteFeedback.type} message={deleteFeedback.message} />
                )}
                <button
                  type="submit"
                  disabled={deleting || deleteConfirm !== 'SUPPRIMER'}
                  className="px-4 py-2.5 bg-[#C7392A] text-white rounded-xl text-sm font-semibold hover:bg-[#a02d20] transition-all disabled:opacity-40"
                >
                  {deleting ? 'Suppression en cours...' : 'Supprimer définitivement mon compte'}
                </button>
              </form>
            )}
          </SectionCard>
        </div>

        {/* ── Contact DPO ───────────────────────────────────── */}
        <div className="glass-dark rounded-2xl p-5 md:p-6 mt-2">
          <div className="flex items-center gap-3 mb-3">
            <Ban className="w-5 h-5 text-[#F95C4B]" />
            <h2 className="text-base font-bold text-[#F6F4F1]">Autres droits — Contact</h2>
          </div>
          <p className="text-sm text-[#B8B0A0] mb-4">
            Pour toute demande non couverte ci-dessus (rectification complexe, plainte auprès de la CNIL, etc.), contactez le responsable du traitement :
          </p>
          <a
            href="mailto:clara.morin@lamanu-student.fr"
            className="inline-flex items-center gap-2 text-[#F95C4B] text-sm font-semibold hover:underline"
          >
            clara.morin@lamanu-student.fr
          </a>
          <p className="text-xs text-[#B8B0A0] mt-3">
            Délai de réponse : 30 jours maximum (Art. 12 RGPD).{' '}
            <a
              href="https://www.cnil.fr/fr/plaintes"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#E4DED2]"
            >
              Saisir la CNIL
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}

function Feedback({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
      type === 'success'
        ? 'bg-[#F5E6C4] border border-[#D4A843]/30 text-[#8C6D2A]'
        : 'bg-[#FDE8E5] border border-[#F95C4B]/30 text-[#C7392A]'
    }`}>
      {type === 'success'
        ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      }
      {message}
    </div>
  );
}
