# 🎬 MovieMatch - Dashboard de Films

Application Next.js pour découvrir, organiser et suivre vos films avec statistiques détaillées, propulsée par TMDB et Supabase.

## ✨ Fonctionnalités

### 🏠 Page d'accueil
- 🔍 **Recherche avancée** - Recherchez des films et séries en temps réel
- 🔥 **Films tendances** - Découvrez les films populaires de la semaine
- 🎬 **Films en salle** - Films actuellement au cinéma
- ⭐ **Recommandations** - Suggestions personnalisées basées sur vos goûts

### 📊 Dashboard Statistiques
- 📈 **Statistiques complètes** - Suivez votre activité cinéma en détail
  - Nombre total de films vus, en watchlist et favoris
  - Films vus cette semaine et ce mois
  - Note moyenne de vos films
  - Temps total de visionnage (jours/heures/minutes)
  - Taux de notation avec barre de progression
- 🎞️ **Liste complète des films vus** - Avec notes, favoris et dates
- 📝 **Watchlist** - Films à voir avec prévisualisation (5 films affichés, "Voir plus" si nécessaire)
- 🏆 **Top Films** - Vos films notés 5 étoiles

### 👤 Profil Utilisateur
- ❤️ **Gestion des favoris** - Collection de vos films préférés
- 📊 **Statistiques personnelles** - Vue d'ensemble de votre activité
- ✏️ **Modification rapide** - Retirez des favoris directement depuis le profil

### 🎯 Gestion de Films
- ✅ **Marquer comme vu** - Ajoutez des films à votre historique
- 📌 **Watchlist** - Créez votre liste de films à voir
- ⭐ **Système de notation** - Notez vos films de 1 à 5 étoiles
- ❤️ **Favoris** - Marquez vos films préférés
- 🗑️ **Suppression** - Retirez des films de votre collection

### 🔐 Authentification
- 📧 **Connexion/Inscription** - Système sécurisé avec Supabase Auth
- 🔒 **Sessions persistantes** - Restez connecté automatiquement
- 👤 **Profils utilisateurs** - Données personnalisées par compte

### 🎨 Interface
- 🖤 **Design épuré** - Interface noir et blanc moderne avec Tailwind CSS
- 📱 **Responsive** - Adapté mobile, tablette et desktop
- ⚡ **Modal interactive** - Détails complets des films avec actions rapides
- 🎭 **Badges visuels** - Notes et favoris directement sur les affiches

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
   - Exécutez les scripts SQL fournis :
     - `supabase_schema.sql` (table user_movies)
     - `supabase_favorites_migration.sql` (colonne favoris)
   - Allez dans Settings > API
   - Copiez l'URL et la clé `anon/public`

5. **Configuration Supabase**

   Dans les paramètres Supabase, ajoutez les URLs autorisées :
   - Allez dans `Authentication > URL Configuration`
   - Ajoutez `http://localhost:3000` dans "Redirect URLs"
   - Ajoutez `http://localhost:3000/**` dans "Site URL"

6. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

7. **Ouvrir l'application**
   
   Visitez [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
src/
├── app/
│   ├── auth/
│   │   ├── login/          # Page de connexion
│   │   └── signup/         # Page d'inscription
│   ├── dashboard/          # Dashboard statistiques complet
│   ├── profile/            # Profil utilisateur avec favoris
│   ├── swipe/              # Page de swipe (placeholder)
│   ├── layout.tsx          # Layout principal avec Header
│   ├── page.tsx            # Page d'accueil avec recherche et découverte
│   └── globals.css         # Styles globaux et polices
├── components/
│   ├── Header.tsx          # Header avec navigation
│   ├── MovieModal.tsx      # Modal détaillée avec actions (vue/watchlist/favoris/notes)
│   └── SearchBar.tsx       # Barre de recherche avec suggestions
├── contexts/
│   └── AuthContext.tsx     # Contexte d'authentification Supabase
└── services/
    ├── tmdb.ts             # Service API TMDB (films, séries, recherche)
    └── movies.ts           # Service Supabase (CRUD user_movies, stats)
```

## 🗄️ Base de données Supabase

### Table `user_movies`

```sql
CREATE TABLE user_movies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  release_date TEXT,
  status TEXT NOT NULL CHECK (status IN ('watched', 'watchlist')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id, media_type)
);
```

### Fonctionnalités de la base
- **Row Level Security (RLS)** - Chaque utilisateur accède uniquement à ses données
- **Triggers automatiques** - Mise à jour de `updated_at` lors des modifications
- **Index optimisés** - Requêtes rapides sur user_id, status, is_favorite
- **Contraintes** - Validation des données (ratings 1-5, status, media_type)

### Scripts SQL fournis
- `supabase_schema.sql` - Création de la table et des policies RLS
- `supabase_favorites_migration.sql` - Migration pour ajouter la colonne favoris

## 🎨 Technologies utilisées

- **Framework** : Next.js 16 (App Router) avec React 19
- **Langage** : TypeScript
- **Styling** : Tailwind CSS 4
- **Authentification** : Supabase Auth
- **Base de données** : Supabase (PostgreSQL)
- **API Films** : The Movie Database (TMDB)
- **Icons** : Lucide React
- **Images** : Next.js Image avec optimisation automatique
- **Animations** : Framer Motion, GSAP (préparées pour futures animations)
- **3D** : Three.js, React Three Fiber (préparées pour futures fonctionnalités)

## � Fonctionnalités clés du code

### Services
- **`tmdbService`** - Interaction avec l'API TMDB
  - Recherche de films et séries
  - Récupération des tendances, films en salle, top rated
  - Détails complets avec cast, genres, runtime
  - Gestion des URLs d'images optimisées
  
- **`moviesService`** - Gestion des données utilisateur via Supabase
  - CRUD complet (Create, Read, Update, Delete)
  - Statistiques avancées (compteurs, moyennes, filtres temporels)
  - Gestion des favoris, watchlist, films vus
  - Calcul du temps de visionnage cumulé

### Composants
- **`MovieModal`** - Modal interactive pour chaque film
  - Affichage des détails TMDB (synopsis, cast, genres, runtime)
  - Actions rapides : Marquer vu/À voir, Noter, Favoris
  - Synchronisation en temps réel avec Supabase
  - Gestion des états (loading, saving, error)
  
- **`SearchBar`** - Recherche en temps réel
  - Debounce pour optimiser les requêtes API
  - Suggestions avec affiches
  - Navigation au clavier
  
- **`Header`** - Navigation responsive
  - Authentification contextuelle
  - Menu adaptatif selon l'état de connexion

### Contexte
- **`AuthContext`** - Gestion globale de l'authentification
  - Session Supabase persistante
  - Hook `useAuth()` pour accès global
  - Protection des routes privées

## �📝 Pages disponibles

- `/` - Page d'accueil avec recherche et découverte
  - Barre de recherche en temps réel
  - Films tendances de la semaine
  - Films actuellement en salle
  - Recommandations personnalisées
- `/dashboard` - Dashboard statistiques complètes (authentification requise)
  - Statistiques détaillées (vus, watchlist, favoris, temps total)
  - Liste complète des films vus avec preview (5 films affichés)
  - Watchlist avec preview
  - Top films (5 étoiles)
- `/profile` - Profil utilisateur (authentification requise)
  - Gestion des favoris
  - Statistiques personnelles
- `/swipe` - Découverte de films par swipe (placeholder - en développement)
- `/auth/login` - Connexion
- `/auth/signup` - Inscription

##  Prochaines fonctionnalités

- [ ] **Système de swipe** - Interface de découverte type Tinder pour les films
  - Animations fluides avec Framer Motion
  - Algorithme de recommandation basé sur les préférences
- [ ] **Statistiques avancées** - Graphiques et visualisations
  - Évolution temporelle de l'activité
  - Genres préférés
  - Acteurs/réalisateurs favoris
- [ ] **Filtres et tri** - Options avancées de filtrage
  - Par genre, année, note
  - Tri multiple (date, note, titre)
- [ ] **Listes personnalisées** - Créer des collections thématiques
  - Listes publiques/privées
  - Partage de listes
- [ ] **Social** - Fonctionnalités communautaires
  - Suivre d'autres utilisateurs
  - Voir les films populaires parmi vos amis
  - Recommandations sociales
- [ ] **Export de données** - Exporter ses statistiques et listes
- [ ] **Mode sombre** - Alternative au thème actuel
- [ ] **PWA** - Application web progressive avec mode hors ligne

## 🤝 Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Guidelines
- Respecter la structure TypeScript existante
- Suivre les conventions de nommage
- Documenter les nouvelles fonctionnalités
- Tester en local avant de soumettre

## 🐛 Problèmes connus

- La page Swipe est actuellement un placeholder
- Les animations Framer Motion et GSAP ne sont pas encore pleinement utilisées
- Three.js est installé mais pas encore intégré

## 📄 License

MIT

## 👤 Auteur

**Clara Morin**

## 🔗 Liens utiles

- [Documentation TMDB API](https://developer.themoviedb.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

⭐ Si ce projet vous plaît, n'hésitez pas à lui donner une étoile !


