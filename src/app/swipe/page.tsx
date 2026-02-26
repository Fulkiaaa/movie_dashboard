'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Heart, X, Info } from 'lucide-react';
import Link from 'next/link';

export default function SwipePage() {
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
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-6">
            Connectez-vous pour découvrir des films
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Découvrir des films 🎬
          </h1>
          <p className="text-gray-600">
            Swipez pour trouver votre prochain film préféré
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-black flex items-center justify-center">
            <Heart className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-black mb-3">
            Fonctionnalité en développement
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            La fonctionnalité de swipe arrive bientôt ! Vous pourrez découvrir des films 
            personnalisés et les ajouter à vos favoris d'un simple geste.
          </p>

          {/* Preview Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-100 rounded-lg p-4">
              <Heart className="w-8 h-8 text-black mx-auto mb-2" />
              <p className="text-sm text-gray-700">Aimer</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              <X className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-700">Passer</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              <Info className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-700">Détails</p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
          >
            Retour au Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
