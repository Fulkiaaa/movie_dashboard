'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  Film,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  Heart,
  ChevronDown,
  Home,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Ferme le dropdown si clic en dehors (plus propre que l'overlay fixed)
  useEffect(() => {
    if (!showDropdown) return;

    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowDropdown(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowDropdown(false);
    };

    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showDropdown]);

  // Ferme le menu mobile avec Escape
  useEffect(() => {
    if (!showMobileMenu) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMobileMenu(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showMobileMenu]);

  const username =
    user?.email?.split('@')[0]?.slice(0, 18) ?? 'Compte';

  return (
    <header className="sticky top-0 z-50 bg-[#F6F4F1]/90 backdrop-blur border-b border-[#E4DED2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[#0D0D0D] p-2 rounded-xl group-hover:scale-105 transition-transform">
              <Film className="w-6 h-6 text-[#F6F4F1]" />
            </div>
            <span className="text-xl font-bold text-[#0D0D0D] tracking-tight">
              SeenIt
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#0D0D0D] hover:bg-[#EBE7E0] transition-colors"
            >
              <Home className="w-4 h-4" />
              Accueil
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#0D0D0D] hover:bg-[#EBE7E0] transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/swipe"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#0D0D0D] hover:bg-[#EBE7E0] transition-colors"
            >
              <Heart className="w-4 h-4" />
              Swipe
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#0D0D0D] hover:bg-[#EBE7E0] transition-colors"
            >
              <User className="w-4 h-4" />
              Mon profil
            </Link>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-9 h-9 rounded-full bg-[#E4DED2] animate-pulse" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDropdown((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={showDropdown}
                  className={[
                    'inline-flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl',
                    'bg-[#E4DED2] hover:bg-[#EBE7E0] transition-colors',
                    'border border-transparent hover:border-[#E4DED2]',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D]/20',
                  ].join(' ')}
                >
                  {/* Avatar simple */}
                  <span className="grid place-items-center w-7 h-7 rounded-lg bg-[#F6F4F1] border border-[#E4DED2]">
                    <User className="w-4 h-4 text-[#0D0D0D]" />
                  </span>

                  <span className="text-sm text-[#0D0D0D] hidden sm:inline max-w-35 truncate">
                    {username}
                  </span>

                  <ChevronDown
                    className={[
                      'w-4 h-4 text-[#B8B0A0] transition-transform',
                      showDropdown ? 'rotate-180' : '',
                    ].join(' ')}
                  />
                </button>

                {/* Dropdown */}
                {showDropdown && (
                  <div
                    role="menu"
                    className={[
                      'absolute right-0 mt-2 w-56 overflow-hidden',
                      'rounded-xl border border-[#E4DED2] bg-[#F6F4F1]',
                      'shadow-[0_8px_24px_rgba(13,13,13,0.12)]',
                      'z-50',
                    ].join(' ')}
                  >
                    <div className="px-4 py-3 border-b border-[#E4DED2]">
                      <p className="text-xs text-[#B8B0A0]">Connecté en tant que</p>
                      <p className="text-sm font-medium text-[#0D0D0D] truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        role="menuitem"
                        className={[
                          'flex items-center gap-2 px-4 py-2.5 text-sm',
                          'text-[#0D0D0D] hover:bg-[#EBE7E0]',
                          'transition-colors',
                        ].join(' ')}
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="w-4 h-4" />
                        Mon profil
                      </Link>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleSignOut}
                        className={[
                          'w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left',
                          'text-[#C7392A] hover:bg-[#FDE8E5]',
                          'transition-colors',
                        ].join(' ')}
                      >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm rounded-lg text-[#0D0D0D] hover:bg-[#EBE7E0] transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm bg-[#F95C4B] text-[#F6F4F1] rounded-lg hover:bg-[#C7392A] transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-[#0D0D0D] hover:bg-[#EBE7E0] transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-[#E4DED2] py-3 bg-[#F6F4F1]">
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 px-4 py-3 text-[#0D0D0D] hover:bg-[#EBE7E0] transition-colors rounded-lg"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Accueil</span>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 px-4 py-3 text-[#0D0D0D] hover:bg-[#EBE7E0] transition-colors rounded-lg"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                href="/swipe"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 px-4 py-3 text-[#0D0D0D] hover:bg-[#EBE7E0] transition-colors rounded-lg"
              >
                <Heart className="w-5 h-5" />
                <span className="font-medium">Swipe</span>
              </Link>
              <Link
                href="/profile"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 px-4 py-3 text-[#0D0D0D] hover:bg-[#EBE7E0] transition-colors rounded-lg"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Mon profil</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
