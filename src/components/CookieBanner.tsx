'use client';

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté les cookies
    const cookiesAccepted = localStorage.getItem('cookies-accepted');
    if (!cookiesAccepted) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookies-accepted', 'true');
    setShowBanner(false);
  };

  const refuseCookies = () => {
    localStorage.setItem('cookies-accepted', 'false');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white border-t-2 border-gray-200 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Content */}
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-6 h-6 text-black flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-black mb-1">🍪 Gestion des cookies</h3>
              <p className="text-sm text-gray-700">
                Nous utilisons des cookies essentiels pour l'authentification et le fonctionnement de l'application.
                En continuant à utiliser SeenIt, vous acceptez notre{' '}
                <Link href="/legal/privacy" className="underline hover:text-black">
                  politique de confidentialité
                </Link>
                {' '}et nos{' '}
                <Link href="/legal/terms" className="underline hover:text-black">
                  conditions d'utilisation
                </Link>.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={refuseCookies}
              className="flex-1 md:flex-initial px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
            >
              Refuser
            </button>
            <button
              onClick={acceptCookies}
              className="flex-1 md:flex-initial px-6 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all"
            >
              Accepter
            </button>
            <button
              onClick={refuseCookies}
              className="p-2 text-gray-400 hover:text-black transition-colors md:hidden"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
