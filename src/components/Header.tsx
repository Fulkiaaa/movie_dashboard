'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Film, Menu, User, LogOut, LayoutDashboard, Heart } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et nom */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-black p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-black">MovieMatch</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/swipe"
              className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
            >
              <Heart className="w-4 h-4" />
              Swipe
            </Link>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-700" />
                  <span className="text-sm text-gray-700 hidden sm:inline">
                    {user.email?.split('@')[0]}
                  </span>
                </button>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="w-4 h-4" />
                      Mon profil
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm text-gray-700 hover:text-black transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                >
                  Inscription
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-700 hover:text-black">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
}
