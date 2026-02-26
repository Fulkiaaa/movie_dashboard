import Link from "next/link";
import { Film, LayoutDashboard, Heart, Sparkles, Zap, Shield } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: LayoutDashboard,
      title: "Dashboard Personnalisé",
      description: "Suivez votre activité cinéma et vos statistiques en temps réel",
    },
    {
      icon: Heart,
      title: "Système de Swipe",
      description: "Découvrez des films avec un système de swipe intuitif",
    },
    {
      icon: Sparkles,
      title: "API TMDB",
      description: "Accédez à une base de données complète de films",
    },
    {
      icon: Zap,
      title: "Temps Réel",
      description: "Synchronisation instantanée avec Supabase",
    },
    {
      icon: Shield,
      title: "Authentification Sécurisée",
      description: "Connexion sécurisée et gestion de profil",
    },
    {
      icon: Film,
      title: "Bibliothèque Complète",
      description: "Gérez vos films vus, favoris et à voir",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="bg-black p-6 rounded-3xl shadow-xl">
                <Film className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-black mb-6">
              MovieMatch
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto">
              Découvrez, organisez et partagez votre passion pour le cinéma
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white hover:bg-gray-100 text-black rounded-xl font-semibold transition-all border-2 border-black"
              >
                Explorer le Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Fonctionnalités
          </h2>
          <p className="text-gray-600 text-lg">
            Tout ce dont vous avez besoin pour gérer vos films
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-black transition-all hover:shadow-lg"
            >
              <div className="w-14 h-14 rounded-xl bg-black p-3 mb-4">
                <feature.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-black rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez MovieMatch dès aujourd'hui et découvrez une nouvelle façon de gérer vos films
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-all"
          >
            Créer un compte
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-black p-2 rounded-lg">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-600">© 2026 MovieMatch</span>
            </div>
            <div className="flex gap-6">
              <Link href="/test" className="text-gray-600 hover:text-black transition-colors">
                Test Connexions
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-black transition-colors">
                Dashboard
              </Link>
              <Link href="/swipe" className="text-gray-600 hover:text-black transition-colors">
                Swipe
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
