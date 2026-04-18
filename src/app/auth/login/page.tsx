'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Film, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#0D0D0D] p-4 rounded-2xl">
            <Film className="w-10 h-10 text-[#F6F4F1]" />
          </div>
        </div>

        {/* Card */}
        <div className="glass-warm rounded-2xl p-8 shadow-[0_8px_32px_rgba(13,13,13,0.10)]">
          <h1 className="text-2xl font-bold text-[#0D0D0D] mb-2 text-center">
            Connexion
          </h1>
          <p className="text-[#B8B0A0] text-center mb-6">
            Accédez à votre compte SeenIt
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-[#FDE8E5] border border-[#F95C4B] rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#C7392A] shrink-0 mt-0.5" />
              <p className="text-sm text-[#C7392A]">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0D0D0D] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8B0A0]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F6F4F1] border border-[#B8B0A0] rounded-lg text-[#0D0D0D] placeholder-[#B8B0A0] focus:outline-none focus:border-2 focus:border-[#F95C4B] transition-colors h-11"
                  placeholder="vous@exemple.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0D0D0D] mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8B0A0]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F6F4F1] border border-[#B8B0A0] rounded-lg text-[#0D0D0D] placeholder-[#B8B0A0] focus:outline-none focus:border-2 focus:border-[#F95C4B] transition-colors h-11"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#F95C4B] text-[#F6F4F1] rounded-lg font-semibold hover:bg-[#C7392A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E4DED2]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-[#B8B0A0]">ou</span>
            </div>
          </div>

          {/* Sign up link */}
          <p className="text-center text-[#B8B0A0] text-sm">
            Pas encore de compte ?{' '}
            <Link
              href="/auth/signup"
              className="text-[#C7392A] hover:underline font-semibold"
            >
              S'inscrire
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-[#B8B0A0] hover:text-[#0D0D0D] text-sm">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
