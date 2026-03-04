import Link from 'next/link';
import { Film } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-lg">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-black font-bold block">SeenIt</span>
              <span className="text-gray-500 text-sm">© 2026 Tous droits réservés</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-black transition-colors text-sm">
              Dashboard
            </Link>
            <Link href="/swipe" className="text-gray-600 hover:text-black transition-colors text-sm">
              Swipe
            </Link>
            <Link href="/profile" className="text-gray-600 hover:text-black transition-colors text-sm">
              Profil
            </Link>
          </div>
        </div>

        {/* Legal links */}
        <div className="border-t border-gray-300 pt-6 mb-6">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/legal/mentions" className="text-gray-600 hover:text-black transition-colors">
              Mentions légales
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/legal/privacy" className="text-gray-600 hover:text-black transition-colors">
              Politique de confidentialité
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/legal/terms" className="text-gray-600 hover:text-black transition-colors">
              CGU
            </Link>
          </div>
        </div>

        {/* TMDB Attribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <svg className="w-16 h-auto" viewBox="0 0 273.42 35.52">
                <defs>
                  <linearGradient id="tmdb-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#90cea1', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#01b4e4', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                <path fill="url(#tmdb-gradient)" d="M35.52 0a35.52 35.52 0 1 1 0 71 35.52 35.52 0 0 1 0-71zM20 34.77L22.8 25h5.12l2.76 9.77 2.92-9.77h5.48l-5.12 14.83h-4.96L25.6 30.6l-3.4 9.22h-4.96L12.12 25h5.48l2.92 9.77z" transform="scale(.5)"/>
              </svg>
            </div>
            <div className="text-xs text-gray-600">
              <p className="font-semibold text-black mb-1">Powered by TMDB</p>
              <p>
                This product uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
