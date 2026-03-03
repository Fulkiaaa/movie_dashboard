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
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Ferme le dropdown si clic en dehors (plus propre que l’overlay fixed)
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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-black p-2 rounded-xl group-hover:scale-105 transition-transform">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-black tracking-tight">
              SeenIt
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/swipe"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
            >
              <Heart className="w-4 h-4" />
              Swipe
            </Link>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDropdown((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={showDropdown}
                  className={[
                    'inline-flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl',
                    'bg-gray-100 hover:bg-gray-200 transition-colors',
                    'border border-transparent hover:border-gray-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
                  ].join(' ')}
                >
                  {/* Avatar simple */}
                  <span className="grid place-items-center w-7 h-7 rounded-lg bg-white border border-gray-200">
                    <User className="w-4 h-4 text-gray-700" />
                  </span>

                  <span className="text-sm text-gray-800 hidden sm:inline max-w-[140px] truncate">
                    {username}
                  </span>

                  <ChevronDown
                    className={[
                      'w-4 h-4 text-gray-600 transition-transform',
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
                      'rounded-xl border border-gray-200 bg-white shadow-lg',
                      'ring-1 ring-black/5',
                      'z-50',
                    ].join(' ')}
                  >
                    {/* petit header optionnel, cohérent et clean */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Connecté en tant que</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        role="menuitem"
                        className={[
                          'flex items-center gap-2 px-4 py-2.5 text-sm',
                          'text-gray-700 hover:text-black hover:bg-gray-100',
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
                          'text-gray-700 hover:text-black hover:bg-gray-100',
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
                  className="px-4 py-2 text-sm rounded-lg text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-3 bg-white">
            <nav className="flex flex-col gap-1">
              <Link
                href="/dashboard"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:text-black hover:bg-gray-100 transition-colors rounded-lg"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                href="/swipe"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:text-black hover:bg-gray-100 transition-colors rounded-lg"
              >
                <Heart className="w-5 h-5" />
                <span className="font-medium">Swipe</span>
              </Link>
              <Link
                href="/profile"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:text-black hover:bg-gray-100 transition-colors rounded-lg"
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