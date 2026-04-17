# SeenIt — Dashboard de Films

Application Next.js pour découvrir, organiser et suivre vos films et séries, propulsée par l'API TMDB et une base de données PostgreSQL locale.

---

## Fonctionnalités

### 🏠 Page d'accueil
- Recherche de films et séries en temps réel avec suggestions
- Films tendances de la semaine
- Films actuellement en salle
- Recommandations personnalisées

### 📊 Dashboard
- Statistiques complètes : films vus, watchlist, favoris, note moyenne, temps total de visionnage, taux de notation
- Aperçu des films récemment vus (lien vers la liste complète)
- Aperçu de la watchlist (lien vers la liste complète)
- Accès rapide au top films (5 étoiles)

### 🃏 Swipe — Découverte de films
Interface de découverte type carte à swiper, entièrement fonctionnelle :
- **Swipe droite** — Marquer comme vu (avec notation optionnelle demi-étoile)
- **Swipe gauche** — Ignorer (film ajouté à une liste de films skippés)
- **Swipe haut** — Ajouter à la watchlist
- Drag souris et touch mobile supportés
- Les films déjà présents dans votre collection ou déjà skippés sont automatiquement exclus
- Chargement dynamique de nouvelles pages quand la liste s'épuise

**Filtres de découverte :**
- Les plus populaires
- Les mieux notés
- Tendances de la semaine
- Par année de sortie
- Par genre
- Filtre personnalisé : genres, langue originale, pays de production, classification (France), plateformes de streaming, période de sortie

**Tutoriel interactif** — Affiché automatiquement à la première session, avec animation des trois directions de swipe et barre de progression. Ignorable à tout moment via le bouton "Passer".

### 👤 Profil
- Liste des favoris (10 maximum) avec accès au détail de chaque film
- Ajout de favoris via une modale de recherche intégrée — seuls les films déjà marqués comme vus peuvent être ajoutés en favori
- Retrait d'un favori directement depuis le profil
- Export des données personnelles (JSON)
- Gestion du compte et des préférences RGPD

### 🎬 Gestion de films (via modal)
- Marquer comme vu ou ajouter à la watchlist
- Notation en demi-étoiles (0,5 à 5)
- Ajouter/retirer des favoris (accessible uniquement si le film est marqué comme vu)
- Retirer un film de la collection
- Synopsis expansible sur mobile

### 🔐 Authentification
- Inscription et connexion par email/mot de passe
- Session persistante via cookie httpOnly (7 jours)
- Auth entièrement custom (JWT + bcrypt) — aucune dépendance externe

### 🎨 Interface
- Design system cohérent avec palette de couleurs sémantique (voir ci-dessous)
- Responsive mobile, tablette, desktop
- Navigation bas de page sur mobile
- Pages légales : CGU, mentions légales, politique de confidentialité
- Bannière de consentement cookie

---

## Design System

Palette de couleurs principale :

| Nom       | Hex       | Rôle                                         |
| --------- | --------- | -------------------------------------------- |
| Paper     | `#F6F4F1` | Fond principal, surfaces claires             |
| Stone     | `#E4DED2` | Fond secondaire, séparateurs                 |
| Coral     | `#F95C4B` | Accent principal — boutons, actions          |
| Eclipse   | `#0D0D0D` | Texte principal, fonds sombres               |
| Gold Reel | `#D4A843` | Notation, badges, highlights                 |
| Sage      | `#6B9472` | Statut "Déjà vu" — vert désaturé             |

Couleurs sémantiques des statuts :

| Statut    | Couleur   | Hex       |
| --------- | --------- | --------- |
| Déjà vu   | Sage      | `#6B9472` |
| À voir    | Gold Reel | `#D4A843` |
| Pas vu    | Stone     | `#E4DED2` |

---

## Démarrage rapide

### Prérequis

- Node.js 18+
- PostgreSQL (local — géré via DBeaver ou équivalent)

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

   Créez un fichier `.env.local` à la racine :

   ```env
   # TMDB
   NEXT_PUBLIC_TMDB_API_KEY=votre_clé_tmdb
   NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
   NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

   # Base de données PostgreSQL locale
   DATABASE_URL=postgresql://postgres:password@localhost:5432/movie_dashboard

   # JWT
   JWT_SECRET=une_clé_secrète_longue_et_aléatoire
   ```

4. **Créer la base de données**

   Exécutez `schema.sql` dans DBeaver (ou tout client PostgreSQL) sur votre base `movie_dashboard`.

   Ce script crée :
   - `users` — comptes utilisateurs
   - `user_movies` — films/séries avec statut, note, favori
   - `skipped_movies` — films ignorés dans le swipe
   - Les index et triggers associés

5. **Obtenir une clé TMDB**

   - Créez un compte sur [TMDB](https://www.themoviedb.org/)
   - Allez dans Paramètres > API et demandez une clé (gratuit)

6. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

7. **Ouvrir l'application**

   [http://localhost:3000](http://localhost:3000)

---

## Structure du projet

```
src/
├── app/
│   ├── api/
│   │   ├── auth/              # signup, login, logout, session
│   │   └── movies/            # CRUD films, stats, favoris, skipped
│   ├── auth/
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/
│   │   ├── page.tsx           # Dashboard principal avec statistiques
│   │   ├── watched/           # Liste complète des films vus
│   │   └── watchlist/         # Liste complète de la watchlist
│   ├── legal/
│   │   ├── mentions/
│   │   ├── privacy/
│   │   └── terms/
│   ├── profile/
│   │   ├── page.tsx           # Profil avec favoris
│   │   └── donnees/           # Gestion des données personnelles (RGPD)
│   ├── swipe/                 # Découverte par swipe
│   ├── layout.tsx
│   ├── page.tsx               # Page d'accueil
│   └── globals.css
├── components/
│   ├── CookieBanner.tsx       # Bannière consentement cookie
│   ├── FavoriteSearchModal.tsx # Modale de recherche pour ajouter un favori
│   ├── Footer.tsx
│   ├── HalfStarRating.tsx     # Notation en demi-étoiles (interactif)
│   ├── Header.tsx
│   ├── MovieModal.tsx         # Modal détaillée avec toutes les actions
│   ├── SearchBar.tsx
│   └── SwipeTutorial.tsx      # Tutoriel animé du système de swipe
├── contexts/
│   └── AuthContext.tsx        # Auth custom JWT
├── lib/
│   ├── auth.ts                # signToken, verifyToken, gestion cookie
│   └── db.ts                  # Pool PostgreSQL (pg)
└── services/
    ├── tmdb.ts                # API TMDB
    └── movies.ts              # Appels aux routes API Next.js
```

---

## Base de données

### Table `user_movies`

```sql
CREATE TABLE user_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title VARCHAR(500) NOT NULL,
  poster_path VARCHAR(500),
  release_date VARCHAR(50),
  status VARCHAR(20) NOT NULL CHECK (status IN ('watched', 'watchlist')),
  rating NUMERIC(3,1) CHECK (rating >= 0 AND rating <= 5),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id, media_type)
);
```

### Table `skipped_movies`

Films ignorés lors du swipe, pour éviter de les reproposer.

```sql
CREATE TABLE skipped_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id, media_type)
);
```

### Règles métier
- Un film ne peut être ajouté en favori que s'il est marqué comme vu
- Maximum 10 favoris par utilisateur
- La notation accepte les demi-points (0,5 à 5,0)
- Un film skippé n'apparaît plus dans le swipe

---

## Technologies

| Catégorie        | Outil                           |
| ---------------- | ------------------------------- |
| Framework        | Next.js 16 — App Router         |
| Langage          | TypeScript                      |
| Styling          | Tailwind CSS 4                  |
| Authentification | JWT custom + bcrypt             |
| Base de données  | PostgreSQL local (pg)           |
| API Films        | TMDB                            |
| Icons            | Lucide React                    |
| Images           | Next.js Image                   |

---

## Pages disponibles

| Route                  | Description                                  | Auth |
| ---------------------- | -------------------------------------------- | ---- |
| `/`                    | Accueil — recherche, tendances, en salle     | Non  |
| `/dashboard`           | Statistiques et aperçu de la collection      | Oui  |
| `/dashboard/watched`   | Liste complète des films vus                 | Oui  |
| `/dashboard/watchlist` | Liste complète de la watchlist               | Oui  |
| `/swipe`               | Découverte de films par swipe                | Oui  |
| `/profile`             | Favoris et informations du compte            | Oui  |
| `/profile/donnees`     | Gestion des données personnelles (RGPD)      | Oui  |
| `/auth/login`          | Connexion                                    | Non  |
| `/auth/signup`         | Inscription                                  | Non  |
| `/legal/terms`         | Conditions générales d'utilisation           | Non  |
| `/legal/privacy`       | Politique de confidentialité                 | Non  |
| `/legal/mentions`      | Mentions légales                             | Non  |

---

## Auteur

**Clara Morin**

---

## Liens utiles

- [Documentation TMDB API](https://developer.themoviedb.org/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
