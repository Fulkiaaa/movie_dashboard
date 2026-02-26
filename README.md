# 🎬 MovieMatch - Dashboard de Films

Application Next.js pour découvrir, organiser et gérer vos films préférés avec TMDB et Supabase.

## ✨ Fonctionnalités

- 🎯 **Dashboard personnalisé** - Suivez votre activité cinéma
- ❤️ **Système de swipe** - Découvrez des films (à venir)
- 🔐 **Authentification** - Connexion/Inscription avec Supabase
- 🎬 **API TMDB** - Base de données complète de films
- 📊 **Statistiques** - Vos films vus, favoris et à voir
- 🎨 **Interface moderne** - Design épuré avec Tailwind CSS

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte TMDB
- Compte Supabase

### Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/Fulkiaaa/movie_dashboard.git
   cd movie_dashboard
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   
   Copiez `.env.example` vers `.env.local` et remplissez vos clés :
   
   ```env
   # TMDB
   NEXT_PUBLIC_TMDB_API_KEY=votre_clé_tmdb
   NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
   NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_publique
   ```

4. **Obtenir les clés API**

   **TMDB :**
   - Créez un compte sur [TMDB](https://www.themoviedb.org/)
   - Allez dans [Paramètres > API](https://www.themoviedb.org/settings/api)
   - Demandez une clé API (gratuit)

   **Supabase :**
   - Créez un compte sur [Supabase](https://supabase.com/)
   - Créez un nouveau projet
   - Allez dans Settings > API
   - Copiez l'URL et la clé `anon/public`

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Ouvrir l'application**
   
   Visitez [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
src/
├── app/
│   ├── auth/
│   │   ├── login/          # Page de connexion
│   │   └── signup/         # Page d'inscription
│   ├── dashboard/          # Dashboard principal
│   ├── profile/            # Profil utilisateur
│   ├── swipe/              # Page de swipe (à venir)
│   ├── test/               # Page de test des connexions
│   ├── layout.tsx          # Layout principal avec Header
│   └── page.tsx            # Page d'accueil
├── components/
│   └── Header.tsx          # Header avec navigation
└── contexts/
    └── AuthContext.tsx     # Contexte d'authentification
```

## 🧪 Tester les connexions

Visitez `/test` pour vérifier que :
- ✅ TMDB API est bien configurée
- ✅ Supabase est accessible

## 🎨 Technologies utilisées

- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Authentification** : Supabase Auth
- **Base de données** : Supabase (PostgreSQL)
- **API Films** : TMDB
- **Icons** : Lucide React
- **Animations** : Framer Motion, GSAP

## 📝 Pages disponibles

- `/` - Page d'accueil
- `/dashboard` - Dashboard (authentification requise)
- `/swipe` - Swipe films (authentification requise)
- `/profile` - Profil utilisateur (authentification requise)
- `/auth/login` - Connexion
- `/auth/signup` - Inscription
- `/test` - Test des connexions API

## 🔧 Configuration Supabase

Pour que l'authentification fonctionne localement, ajoutez cette URL dans les paramètres Supabase :

1. Allez dans `Authentication > URL Configuration`
2. Ajoutez `http://localhost:3000` dans les "Redirect URLs"

## 🚧 Prochaines fonctionnalités

- [ ] Système de swipe fonctionnel
- [ ] Gestion des favoris
- [ ] Historique des films vus
- [ ] Recommandations personnalisées
- [ ] Partage de listes
- [ ] Mode hors ligne

## 📄 License

MIT

## 👤 Auteur

Clara Morin

