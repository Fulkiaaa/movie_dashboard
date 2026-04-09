import Link from "next/link";
import { Film } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#E4DED2] bg-[#E4DED2] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#0D0D0D] p-2 rounded-lg">
              <Film className="w-5 h-5 text-[#F6F4F1]" />
            </div>
            <div>
              <span className="text-[#0D0D0D] font-bold block">SeenIt</span>
              <span className="text-[#B8B0A0] text-sm">
                © 2026 Tous droits réservés
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link
              href="/dashboard"
              className="text-[#0D0D0D] hover:text-[#F95C4B] transition-colors text-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/swipe"
              className="text-[#0D0D0D] hover:text-[#F95C4B] transition-colors text-sm"
            >
              Swipe
            </Link>
            <Link
              href="/profile"
              className="text-[#0D0D0D] hover:text-[#F95C4B] transition-colors text-sm"
            >
              Profil
            </Link>
          </div>
        </div>

        {/* Legal links */}
        <div className="border-t border-[#B8B0A0] pt-6 mb-6">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/legal/mentions"
              className="text-[#0D0D0D] hover:text-[#F95C4B] transition-colors"
            >
              Mentions légales
            </Link>
            <span className="text-[#B8B0A0]">•</span>
            <Link
              href="/legal/privacy"
              className="text-[#0D0D0D] hover:text-[#F95C4B] transition-colors"
            >
              Politique de confidentialité
            </Link>
            <span className="text-[#B8B0A0]">•</span>
            <Link
              href="/legal/terms"
              className="text-[#0D0D0D] hover:text-[#F95C4B] transition-colors"
            >
              CGU
            </Link>
          </div>
        </div>

        {/* TMDB Attribution */}
        <div className="bg-[#F6F4F1] border border-[#E4DED2] rounded-lg p-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <svg className="w-16 h-auto" viewBox="0 0 273.42 35.52">
                <defs>
                  <linearGradient
                    id="tmdb-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#90cea1", stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#01b4e4", stopOpacity: 1 }}
                    />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#tmdb-gradient)"
                  d="M35.52 0a35.52 35.52 0 1 1 0 71 35.52 35.52 0 0 1 0-71zM20 34.77L22.8 25h5.12l2.76 9.77 2.92-9.77h5.48l-5.12 14.83h-4.96L25.6 30.6l-3.4 9.22h-4.96L12.12 25h5.48l2.92 9.77z"
                  transform="scale(.5)"
                />
              </svg>
            </div>
            <div className="text-xs text-[#B8B0A0]">
              <p className="font-semibold text-[#0D0D0D] mb-1">
                Powered by TMDB
              </p>
              <p>
                This product uses the TMDB API but is not endorsed or certified
                by TMDB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
