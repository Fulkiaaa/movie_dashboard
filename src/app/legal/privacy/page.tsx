"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Database,
  Lock,
  Eye,
  PencilLine,
  Trash2,
  Download,
  PauseCircle,
  Ban,
  BotOff,
  Info,
  Mail,
} from "lucide-react";

const RIGHTS = [
  {
    icon: Info,
    article: "Art. 13",
    title: "Droit d'être informé",
    desc: "Vous savez quelles données sont collectées, pourquoi, par qui et pour combien de temps — dès la collecte.",
  },
  {
    icon: Eye,
    article: "Art. 15",
    title: "Droit d'accès",
    desc: "Consultez l'intégralité de vos données depuis votre espace RGPD ou en faisant une demande par email.",
  },
  {
    icon: PencilLine,
    article: "Art. 16",
    title: "Droit de rectification",
    desc: "Modifiez votre email ou mot de passe à tout moment depuis votre espace RGPD.",
  },
  {
    icon: Trash2,
    article: "Art. 17",
    title: "Droit à l'effacement",
    desc: "Supprimez définitivement votre compte et toutes vos données depuis votre espace RGPD.",
  },
  {
    icon: PauseCircle,
    article: "Art. 18",
    title: "Droit à la limitation",
    desc: "Limitez le traitement à l'essentiel (connexion, affichage) en désactivant analyses et statistiques.",
  },
  {
    icon: Download,
    article: "Art. 20",
    title: "Droit à la portabilité",
    desc: "Téléchargez l'export complet de vos données au format JSON structuré et interopérable.",
  },
  {
    icon: Ban,
    article: "Art. 21",
    title: "Droit d'opposition",
    desc: "Opposez-vous au traitement de vos données pour les recommandations personnalisées.",
  },
  {
    icon: BotOff,
    article: "Art. 22",
    title: "Décisions automatisées",
    desc: "Désactivez les recommandations basées sur votre profil. Aucune décision contraignante n'est automatisée.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F6F4F1]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#B8B0A0] hover:text-[#0D0D0D] transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-[#F95C4B]" />
            <h1 className="text-3xl md:text-4xl font-bold text-[#0D0D0D]">
              Politique de Confidentialité
            </h1>
          </div>
          <p className="text-[#B8B0A0] text-sm ml-11">
            Conforme au RGPD (UE 2016/679) — Dernière mise à jour : Avril 2026
          </p>
        </div>

        {/* Alert */}
        <div className="bg-[#E4DED2] border-l-4 border-[#F95C4B] rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#F95C4B] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#0D0D0D] mb-1">Votre vie privée nous tient à cœur</p>
              <p className="text-sm text-[#0D0D0D]">
                SeenIt s'engage à protéger vos données personnelles conformément au RGPD.
                Aucune donnée n'est vendue à des tiers. Aucune publicité ciblée.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">

          {/* 1. Responsable */}
          <section className="bg-[#F6F4F1] border border-[#E4DED2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(13,13,13,0.06)]">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#F95C4B] shrink-0 mt-0.5" />
              <h2 className="text-lg font-bold text-[#0D0D0D]">1. Responsable du traitement</h2>
            </div>
            <div className="bg-[#E4DED2] rounded-xl p-4 text-sm text-[#0D0D0D] space-y-1.5">
              <p><span className="font-semibold">Nom :</span> SeenIt</p>
              <p><span className="font-semibold">Responsable :</span> Clara Morin</p>
              <p><span className="font-semibold">Contact :</span>{" "}
                <a href="mailto:clara.morin@lamanu-student.fr" className="text-[#C7392A] hover:underline font-medium">
                  clara.morin@lamanu-student.fr
                </a>
              </p>
              <p><span className="font-semibold">Base juridique :</span> Droit français — RGPD (UE 2016/679)</p>
            </div>
          </section>

          {/* 2. Données collectées */}
          <section className="bg-[#F6F4F1] border border-[#E4DED2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(13,13,13,0.06)]">
            <div className="flex items-start gap-3 mb-4">
              <Database className="w-5 h-5 text-[#F95C4B] shrink-0 mt-0.5" />
              <h2 className="text-lg font-bold text-[#0D0D0D]">2. Données collectées</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#E4DED2] text-[#0D0D0D]">
                    <th className="px-4 py-2.5 text-left font-semibold rounded-tl-lg">Catégorie</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Données</th>
                    <th className="px-4 py-2.5 text-left font-semibold rounded-tr-lg">Base légale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DED2]">
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#0D0D0D]">Identification</td>
                    <td className="px-4 py-3 text-[#B8B0A0]">Adresse email, mot de passe (haché bcrypt)</td>
                    <td className="px-4 py-3 text-[#B8B0A0]">Contrat</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#0D0D0D]">Activité</td>
                    <td className="px-4 py-3 text-[#B8B0A0]">Films vus, watchlist, notes (1-5), favoris, films ignorés</td>
                    <td className="px-4 py-3 text-[#B8B0A0]">Contrat</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#0D0D0D]">Technique</td>
                    <td className="px-4 py-3 text-[#B8B0A0]">Cookie JWT httpOnly (auth_token, 7 jours)</td>
                    <td className="px-4 py-3 text-[#B8B0A0]">Intérêt légitime</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#0D0D0D]">Préférences RGPD</td>
                    <td className="px-4 py-3 text-[#B8B0A0]">Consentement, limitations, oppositions</td>
                    <td className="px-4 py-3 text-[#B8B0A0]">Obligation légale</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. Finalités */}
          <section className="bg-[#F6F4F1] border border-[#E4DED2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(13,13,13,0.06)]">
            <div className="flex items-start gap-3 mb-4">
              <Eye className="w-5 h-5 text-[#F95C4B] shrink-0 mt-0.5" />
              <h2 className="text-lg font-bold text-[#0D0D0D]">3. Finalités du traitement</h2>
            </div>
            <ul className="space-y-2 text-sm text-[#0D0D0D]">
              {[
                "Authentification et sécurisation du compte",
                "Sauvegarde et affichage de votre collection de films",
                "Génération de recommandations personnalisées (désactivable)",
                "Statistiques personnelles dans le dashboard",
                "Respect de vos droits RGPD",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F95C4B] mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-[#E4DED2] rounded-lg">
              <p className="text-sm font-semibold text-[#0D0D0D]">
                ✓ Nous ne vendons jamais vos données. ✓ Pas de publicité ciblée. ✓ Pas de partage tiers.
              </p>
            </div>
          </section>

          {/* 4. Sécurité */}
          <section className="bg-[#F6F4F1] border border-[#E4DED2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(13,13,13,0.06)]">
            <div className="flex items-start gap-3 mb-4">
              <Lock className="w-5 h-5 text-[#F95C4B] shrink-0 mt-0.5" />
              <h2 className="text-lg font-bold text-[#0D0D0D]">4. Sécurité &amp; conservation</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                { label: "Mots de passe", value: "Hachés avec bcrypt (cost 12)" },
                { label: "Sessions", value: "JWT httpOnly, 7 jours, SameSite=Lax" },
                { label: "Transit", value: "HTTPS en production" },
                { label: "Accès", value: "Chaque requête API vérifie le JWT" },
                { label: "Hébergement", value: "Base de données PostgreSQL locale" },
                { label: "Conservation", value: "Durée du compte + 30 jours post-suppression" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#E4DED2] rounded-lg p-3">
                  <p className="font-semibold text-[#0D0D0D]">{label}</p>
                  <p className="text-[#B8B0A0]">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Vos droits */}
          <section className="bg-[#F6F4F1] border border-[#E4DED2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(13,13,13,0.06)]">
            <div className="flex items-start gap-3 mb-5">
              <Shield className="w-5 h-5 text-[#F95C4B] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-[#0D0D0D]">5. Vos 8 droits RGPD</h2>
                <p className="text-sm text-[#B8B0A0] mt-1">
                  Tous exercables depuis votre{" "}
                  <Link href="/profile/donnees" className="text-[#C7392A] underline font-medium hover:no-underline">
                    espace RGPD
                  </Link>{" "}
                  ou par email.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {RIGHTS.map(({ icon: Icon, article, title, desc }) => (
                <div key={article} className="bg-[#E4DED2] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-[#F95C4B] shrink-0" />
                    <span className="text-xs font-bold text-[#B8B0A0] uppercase tracking-wide">{article}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0D0D0D] mb-1">{title}</h3>
                  <p className="text-xs text-[#B8B0A0] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href="/profile/donnees"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F95C4B] text-white rounded-xl text-sm font-semibold hover:bg-[#C7392A] transition-all"
              >
                <Shield className="w-4 h-4" />
                Gérer mes droits RGPD
              </Link>
              <a
                href="mailto:clara.morin@lamanu-student.fr"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E4DED2] text-[#0D0D0D] rounded-xl text-sm font-semibold hover:bg-[#D6CFBF] transition-all"
              >
                <Mail className="w-4 h-4" />
                Contacter le DPO
              </a>
            </div>
          </section>

          {/* 6. Cookies */}
          <section className="bg-[#F6F4F1] border border-[#E4DED2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(13,13,13,0.06)]">
            <h2 className="text-lg font-bold text-[#0D0D0D] mb-4">6. Cookies</h2>
            <p className="text-sm text-[#0D0D0D] mb-4">
              SeenIt n'utilise que des cookies <strong>strictement nécessaires</strong> au fonctionnement.
              Aucun cookie de tracking, analytique ou publicitaire.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#E4DED2] text-[#0D0D0D]">
                    <th className="px-4 py-2.5 text-left font-semibold rounded-tl-lg">Cookie</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Durée</th>
                    <th className="px-4 py-2.5 text-left font-semibold rounded-tr-lg">Fonction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs text-[#0D0D0D]">auth_token</td>
                    <td className="px-4 py-3 text-[#B8B0A0]">7 jours</td>
                    <td className="px-4 py-3 text-[#B8B0A0]">Session JWT httpOnly — authentification</td>
                  </tr>
                  <tr className="border-t border-[#E4DED2]">
                    <td className="px-4 py-3 font-mono text-xs text-[#0D0D0D]">cookies-accepted</td>
                    <td className="px-4 py-3 text-[#B8B0A0]">Permanent</td>
                    <td className="px-4 py-3 text-[#B8B0A0]">Mémorisation du choix bannière cookies (localStorage)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 7. TMDB */}
          <section className="bg-[#F6F4F1] border border-[#E4DED2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(13,13,13,0.06)]">
            <h2 className="text-lg font-bold text-[#0D0D0D] mb-3">7. Données TMDB</h2>
            <p className="text-sm text-[#0D0D0D] mb-3">
              Les informations sur les films (titres, affiches, synopsis) proviennent de{" "}
              <strong>The Movie Database (TMDB)</strong>. Ces données sont publiques et ne vous concernent pas personnellement.
            </p>
            <div className="bg-[#E4DED2] rounded-lg p-3 text-xs text-[#B8B0A0]">
              This product uses the TMDB API but is not endorsed or certified by TMDB.{" "}
              <a
                href="https://www.themoviedb.org/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C7392A] underline"
              >
                Politique TMDB →
              </a>
            </div>
          </section>

          {/* 8. Contact & CNIL */}
          <section className="bg-[#0D0D0D] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#F6F4F1] mb-3">8. Contact &amp; recours</h2>
            <p className="text-sm text-[#B8B0A0] mb-4">
              Pour exercer vos droits ou poser toute question relative à vos données :
            </p>
            <div className="space-y-3">
              <a
                href="mailto:clara.morin@lamanu-student.fr"
                className="flex items-center gap-2 text-[#F95C4B] text-sm font-semibold hover:underline"
              >
                <Mail className="w-4 h-4" />
                clara.morin@lamanu-student.fr
              </a>
              <p className="text-xs text-[#B8B0A0]">
                Délai de réponse : 30 jours (Art. 12 RGPD). En cas de réponse insatisfaisante, vous pouvez{" "}
                <a
                  href="https://www.cnil.fr/fr/plaintes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#E4DED2]"
                >
                  saisir la CNIL
                </a>
                .
              </p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-10 pt-6 border-t border-[#E4DED2]">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/legal/mentions" className="text-[#B8B0A0] hover:text-[#0D0D0D] transition-colors">
              Mentions légales
            </Link>
            <span className="text-[#E4DED2]">•</span>
            <Link href="/legal/terms" className="text-[#B8B0A0] hover:text-[#0D0D0D] transition-colors">
              CGU
            </Link>
            <span className="text-[#E4DED2]">•</span>
            <Link href="/profile/donnees" className="text-[#B8B0A0] hover:text-[#0D0D0D] transition-colors">
              Mes droits RGPD
            </Link>
            <span className="text-[#E4DED2]">•</span>
            <Link href="/" className="text-[#B8B0A0] hover:text-[#0D0D0D] transition-colors">
              Accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
