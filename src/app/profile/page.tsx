'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-6">
            Connectez-vous pour voir votre profil
          </p>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
          {/* Avatar */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black mb-1">
                {user.email?.split('@')[0]}
              </h2>
              <p className="text-gray-600">Membre MovieMatch</p>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
              <Mail className="w-5 h-5 text-gray-700" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-black font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-700" />
              <div>
                <p className="text-sm text-gray-600">Membre depuis</p>
                <p className="text-black font-medium">
                  {new Date(user.created_at || '').toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 text-center">
          <Link
            href="/dashboard"
            className="text-gray-700 hover:text-black underline"
          >
            ← Retour au Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
