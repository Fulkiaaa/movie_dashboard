'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle, XCircle, AlertTriangle, UserX } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen">
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
            <FileText className="w-8 h-8 text-black" />
            <h1 className="text-3xl md:text-4xl font-bold text-black">
              Conditions Générales d'Utilisation
            </h1>
          </div>
          <p className="text-gray-600">Dernière mise à jour : Mars 2026</p>
        </div>

        {/* Alert box */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">En utilisant SeenIt, vous acceptez ces conditions</h3>
              <p className="text-yellow-800 text-sm">
                Veuillez lire attentivement ces CGU. Si vous n'acceptez pas ces conditions, 
                veuillez ne pas utiliser l'application.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-black mb-4">1. Objet</h2>
            <p className="text-gray-700 mb-3">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de 
              l'application web <strong>SeenIt</strong>, accessible à l'adresse [votre-domaine.com].
            </p>
            <p className="text-gray-700">
              SeenIt est une plateforme gratuite permettant aux utilisateurs de :
            </p>
            <ul className="mt-3 space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Rechercher des films et séries</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Créer une liste de films vus et à voir</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Noter et marquer des favoris</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Découvrir du contenu via un système de swipe</span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-black mb-4">2. Acceptation des CGU</h2>
            <p className="text-gray-700 mb-3">
              L'utilisation de SeenIt implique l'acceptation pleine et entière des présentes CGU.
            </p>
            <p className="text-gray-700">
              En créant un compte ou en utilisant l'application, vous reconnaissez avoir lu, 
              compris et accepté les présentes conditions.
            </p>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-black mb-4">3. Création de compte</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-black mb-2">3.1 Conditions</h3>
                <p>Pour créer un compte, vous devez :</p>
                <ul className="mt-2 ml-6 space-y-1">
                  <li>• Avoir au moins 13 ans</li>
                  <li>• Fournir une adresse email valide</li>
                  <li>• Choisir un mot de passe sécurisé</li>
                  <li>• Accepter les présentes CGU et la politique de confidentialité</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">3.2 Responsabilité</h3>
                <p>
                  Vous êtes responsable de la confidentialité de vos identifiants de connexion. 
                  Toute activité effectuée depuis votre compte est présumée avoir été effectuée par vous.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">3.3 Un compte par personne</h3>
                <p>
                  Chaque utilisateur ne peut créer qu'un seul compte. La création de plusieurs comptes 
                  peut entraîner la suspension de tous vos comptes.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-black mb-4">4. Utilisation du service</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Vous êtes autorisé à :
                </h3>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li>• Utiliser SeenIt à des fins personnelles et non commerciales</li>
                  <li>• Créer et gérer votre collection de films et séries</li>
                  <li>• Partager vos recommandations de manière respectueuse</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Vous n'êtes PAS autorisé à :
                </h3>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li>• Utiliser SeenIt à des fins commerciales sans autorisation</li>
                  <li>• Extraire ou collecter des données de manière automatisée (scraping)</li>
                  <li>• Tenter de contourner les mesures de sécurité</li>
                  <li>• Publier du contenu illégal, offensant ou inapproprié</li>
                  <li>• Usurper l'identité d'une autre personne</li>
                  <li>• Compromettre la performance ou la sécurité de l'application</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-black mb-4">5. Contenu et Propriété intellectuelle</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-black mb-2">5.1 Données TMDB</h3>
                <p className="mb-2">
                  Les informations sur les films et séries (titres, images, synopsis, etc.) proviennent 
                  de <strong>The Movie Database (TMDB)</strong>.
                </p>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Attribution TMDB :</strong> This product uses the TMDB API but is not endorsed 
                    or certified by TMDB. Les données TMDB sont soumises à leurs propres conditions d'utilisation.
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">5.2 Vos données</h3>
                <p>
                  Vous conservez la propriété de vos données personnelles (listes, notes, favoris). 
                  SeenIt ne revendique aucun droit sur votre contenu.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">5.3 Code et design</h3>
                <p>
                  Le code source, le design et l'interface de SeenIt sont protégés par le droit d'auteur. 
                  Toute reproduction sans autorisation est interdite.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-black mb-4">6. Disponibilité du service</h2>
            <p className="text-gray-700 mb-3">
              SeenIt s'efforce d'assurer une disponibilité maximale de l'application, mais ne peut 
              garantir un accès ininterrompu.
            </p>
            <p className="text-gray-700">
              Nous nous réservons le droit de :
            </p>
            <ul className="mt-3 space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-black">•</span>
                <span>Interrompre temporairement le service pour maintenance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black">•</span>
                <span>Modifier ou arrêter certaines fonctionnalités</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black">•</span>
                <span>Mettre fin au service avec un préavis raisonnable</span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-black mb-4">7. Limitation de responsabilité</h2>
            <p className="text-gray-700 mb-3">
              SeenIt est fourni "tel quel" sans garantie d'aucune sorte.
            </p>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-sm text-red-900 mb-2">
                <strong>Clause importante :</strong>
              </p>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• SeenIt ne garantit pas l'exactitude des informations sur les films (données TMDB)</li>
                <li>• SeenIt ne saurait être tenu responsable de la perte de vos données (effectuez des sauvegardes)</li>
                <li>• Nous déclinons toute responsabilité en cas de dommages directs ou indirects liés à l'utilisation du service</li>
              </ul>
            </div>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <UserX className="w-6 h-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-black mb-3">8. Suspension et résiliation</h2>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold text-black mb-2">8.1 Par l'utilisateur</h3>
                    <p>
                      Vous pouvez supprimer votre compte à tout moment depuis votre profil. 
                      Cette action est irréversible et entraîne la suppression définitive de vos données.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-2">8.2 Par SeenIt</h3>
                    <p className="mb-2">
                      Nous nous réservons le droit de suspendre ou supprimer votre compte en cas de :
                    </p>
                    <ul className="space-y-1 ml-6">
                      <li>• Non-respect des présentes CGU</li>
                      <li>• Utilisation abusive ou frauduleuse du service</li>
                      <li>• Activité suspecte ou malveillante</li>
                      <li>• Non-utilisation prolongée (plus de 2 ans)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-black mb-4">9. Modifications des CGU</h2>
            <p className="text-gray-700 mb-3">
              SeenIt se réserve le droit de modifier les présentes CGU à tout moment.
            </p>
            <p className="text-gray-700">
              Les modifications entreront en vigueur dès leur publication sur cette page. 
              Nous vous informerons des changements significatifs par email ou via une notification 
              dans l'application.
            </p>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-black mb-4">10. Droit applicable et litiges</h2>
            <p className="text-gray-700 mb-3">
              Les présentes CGU sont régies par le droit français.
            </p>
            <p className="text-gray-700">
              En cas de litige, nous vous invitons à nous contacter pour trouver une solution amiable. 
              À défaut, les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section className="bg-black text-white rounded-xl p-6">
            <h2 className="text-xl font-bold mb-3">11. Contact</h2>
            <p className="text-gray-300 mb-2">
              Pour toute question concernant ces CGU :
            </p>
            <a 
              href="mailto:clara.morin@lamanu-student.fr" 
              className="inline-flex items-center gap-2 text-white font-semibold hover:underline"
            >
              📧 clara.morin@lamanu-student.fr
            </a>
          </section>

          <section className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
            <h3 className="font-bold text-green-900 mb-2">✓ Merci d'utiliser SeenIt !</h3>
            <p className="text-green-800 text-sm">
              En acceptant ces conditions, vous rejoignez une communauté de cinéphiles passionnés. 
              Profitez de l'application et bon visionnage ! 🎬
            </p>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/legal/mentions" className="text-gray-600 hover:text-black transition-colors">
              Mentions légales
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/legal/privacy" className="text-gray-600 hover:text-black transition-colors">
              Politique de confidentialité
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
