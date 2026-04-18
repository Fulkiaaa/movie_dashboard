"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Building2, Globe, Scale } from "lucide-react";

export default function MentionsLegalesPage() {
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
            <Scale className="w-8 h-8 text-black" />
            <h1 className="text-3xl md:text-4xl font-bold text-black">
              Mentions Légales
            </h1>
          </div>
          <p className="text-gray-600">Dernière mise à jour : Mars 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8 bg-gray-50 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Building2 className="w-6 h-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-black mb-2">
                  Éditeur du site
                </h2>
                <p className="text-gray-700 mb-2">
                  <strong>Nom :</strong> SeenIt
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Forme juridique :</strong> Application web personnelle
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Responsable de publication :</strong> Clara Morin
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8 bg-gray-50 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Mail className="w-6 h-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-black mb-2">Contact</h2>
                <p className="text-gray-700 mb-3">
                  Pour toute question concernant le site ou vos données
                  personnelles, vous pouvez nous contacter :
                </p>
                <a
                  href="mailto:clara.morin@lamanu-student.fr"
                  className="inline-flex items-center gap-2 text-black font-semibold hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  clara.morin@lamanu-student.fr
                </a>
              </div>
            </div>
          </section>

          <section className="mb-8 bg-gray-50 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Globe className="w-6 h-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-black mb-2">
                  Hébergement
                </h2>
                <p className="text-gray-700 mb-2">
                  <strong>Hébergeur web :</strong>--------
                </p>
                <p className="text-gray-700 mb-2">
                  --------
                  <br />
                  -----
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Base de données :</strong> --------
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-black mb-4">
              Propriété intellectuelle
            </h2>
            <p className="text-gray-700 mb-4">
              Le contenu de ce site (structure, textes, logiciels, graphismes,
              etc.) est la propriété de SeenIt, sauf mention contraire.
            </p>
            <p className="text-gray-700 mb-4">
              Les données relatives aux films et séries sont fournies par{" "}
              <strong>The Movie Database (TMDB)</strong>. Ce produit utilise
              l'API TMDB mais n'est ni cautionné ni certifié par TMDB.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-900">
                <strong>Attribution TMDB :</strong> This product uses the TMDB
                API but is not endorsed or certified by TMDB.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-black mb-4">
              Responsabilité
            </h2>
            <p className="text-gray-700 mb-4">
              SeenIt ne saurait être tenu responsable des erreurs ou omissions
              dans les informations diffusées sur le site, ni des dommages
              directs ou indirects résultant de l'utilisation du site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-black mb-4">
              Liens hypertextes
            </h2>
            <p className="text-gray-700 mb-4">
              Le site peut contenir des liens vers d'autres sites. SeenIt
              n'exerce aucun contrôle sur ces sites et décline toute
              responsabilité quant à leur contenu.
            </p>
          </section>

          <section className="bg-gray-100 rounded-xl p-6">
            <h2 className="text-xl font-bold text-black mb-4">
              Droit applicable
            </h2>
            <p className="text-gray-700">
              Les présentes mentions légales sont régies par le droit français.
              En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link
              href="/legal/privacy"
              className="text-gray-600 hover:text-black transition-colors"
            >
              Politique de confidentialité
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/legal/terms"
              className="text-gray-600 hover:text-black transition-colors"
            >
              CGU
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/"
              className="text-gray-600 hover:text-black transition-colors"
            >
              Accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
