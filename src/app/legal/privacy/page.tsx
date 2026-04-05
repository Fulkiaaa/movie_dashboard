'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Database, Lock, Eye, UserCheck, Trash2, Download } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-black" />
            <h1 className="text-3xl md:text-4xl font-bold text-black">Politique de Confidentialité</h1>
          </div>
          <p className="text-gray-600">Conforme au RGPD - Dernière mise à jour : Mars 2026</p>
        </div>

        {/* Alert box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
          <h3 className="font-bold text-blue-900 mb-2">🔒 Votre vie privée nous tient à cœur</h3>
          <p className="text-blue-800 text-sm">
            SeenIt s'engage à protéger vos données personnelles conformément au Règlement Général 
            sur la Protection des Données (RGPD) et à la loi française.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <section className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Database className="w-6 h-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-black mb-3">Données collectées</h2>
                <p className="text-gray-700 mb-4">
                  Nous collectons uniquement les données nécessaires au fonctionnement de l'application :
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold">•</span>
                    <span><strong>Données d'identification :</strong> Adresse email (pour l'authentification)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold">•</span>
                    <span><strong>Données de navigation :</strong> Films/séries vus, watchlist, notes, favoris</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold">•</span>
                    <span><strong>Données techniques :</strong> Cookies d'authentification (strictement nécessaires)</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Eye className="w-6 h-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-black mb-3">Utilisation des données</h2>
                <p className="text-gray-700 mb-4">
                  Vos données sont utilisées exclusivement pour :
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold">•</span>
                    <span>Gérer votre compte utilisateur</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold">•</span>
                    <span>Sauvegarder vos préférences et votre collection de films</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold">•</span>
                    <span>Générer des recommandations personnalisées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold">•</span>
                    <span>Améliorer l'expérience utilisateur de l'application</span>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-900 text-sm">
                    <strong>✓ Nous ne vendons JAMAIS vos données à des tiers.</strong>
                  </p>
                  <p className="text-green-800 text-sm mt-1">
                    ✓ Nous n'utilisons pas de publicité ciblée.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Lock className="w-6 h-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-black mb-3">Stockage et sécurité</h2>
                <p className="text-gray-700 mb-4">
                  Vos données sont stockées de manière sécurisée sur une base de données <strong>PostgreSQL locale</strong> :
                </p>
                <ul className="space-y-2 text-gray-700 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold">•</span>
                    <span><strong>Hébergement :</strong> Base de données locale, vos données restent sur votre infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold">•</span>
                    <span><strong>Chiffrement :</strong> Toutes les données sont chiffrées en transit (HTTPS)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold">•</span>
                    <span><strong>Authentification :</strong> Mots de passe hachés avec bcrypt, sessions via JWT (cookie httpOnly)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold">•</span>
                    <span><strong>Accès :</strong> Chaque requête API vérifie le token JWT — vos données sont isolées et privées</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-black mb-3">Vos droits (RGPD)</h2>
                <p className="text-gray-700 mb-4">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <Eye className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-black">Droit d'accès</h3>
                      <p className="text-sm text-gray-600">Consulter toutes vos données depuis votre profil</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <Download className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-black">Droit à la portabilité</h3>
                      <p className="text-sm text-gray-600">Exporter vos données au format standard</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <Trash2 className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-black">Droit à l'effacement</h3>
                      <p className="text-sm text-gray-600">Supprimer définitivement votre compte et toutes vos données</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-4">
                  Pour exercer ces droits, rendez-vous dans votre{' '}
                  <Link href="/profile" className="text-black underline hover:no-underline font-semibold">
                    profil utilisateur
                  </Link>
                  {' '}ou contactez-nous à{' '}
                  <a href="mailto:clara.morin@lamanu-student.fr" className="text-black underline hover:no-underline font-semibold">
                    clara.morin@lamanu-student.fr
                  </a>.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-black mb-3">Cookies</h2>
            <p className="text-gray-700 mb-4">
              SeenIt utilise uniquement des <strong>cookies strictement nécessaires</strong> au fonctionnement 
              de l'application (authentification). Aucun cookie de tracking ou publicitaire n'est utilisé.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Cookie</th>
                    <th className="px-4 py-2 text-left font-semibold">Durée</th>
                    <th className="px-4 py-2 text-left font-semibold">Fonction</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 font-mono text-xs">auth_token</td>
                    <td className="px-4 py-3">7 jours</td>
                    <td className="px-4 py-3">Session d'authentification (JWT httpOnly)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-black mb-3">Données TMDB</h2>
            <p className="text-gray-700 mb-4">
              Les informations sur les films et séries proviennent de{' '}
              <strong>The Movie Database (TMDB)</strong>. Ces données sont publiques et ne vous 
              concernent pas personnellement.
            </p>
            <p className="text-sm text-gray-600">
              TMDB a sa propre politique de confidentialité consultable sur{' '}
              <a href="https://www.themoviedb.org/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-black underline">
                themoviedb.org/privacy-policy
              </a>
            </p>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-black mb-3">Conservation des données</h2>
            <p className="text-gray-700">
              Vos données personnelles sont conservées tant que votre compte est actif. 
              En cas de suppression de compte, toutes vos données sont supprimées définitivement 
              sous 30 jours (délai légal de rétractation).
            </p>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-black mb-3">Modifications</h2>
            <p className="text-gray-700">
              Cette politique de confidentialité peut être mise à jour. Nous vous informerons 
              de tout changement significatif par email ou via une notification dans l'application.
            </p>
          </section>

          <section className="bg-black text-white rounded-xl p-6">
            <h2 className="text-xl font-bold mb-3">Contact & DPO</h2>
            <p className="text-gray-300 mb-4">
              Pour toute question concernant vos données personnelles ou pour exercer vos droits :
            </p>
            <a 
              href="mailto:clara.morin@lamanu-student.fr" 
              className="inline-flex items-center gap-2 text-white font-semibold hover:underline"
            >
              📧 clara.morin@lamanu-student.fr
            </a>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/legal/mentions" className="text-gray-600 hover:text-black transition-colors">
              Mentions légales
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/legal/terms" className="text-gray-600 hover:text-black transition-colors">
              CGU
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/" className="text-gray-600 hover:text-black transition-colors">
              Accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
