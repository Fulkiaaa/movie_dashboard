# Configuration TMDB et Supabase

## 📋 Fichiers créés

### 1. `.env.local` et `.env.example`
Fichiers de configuration des variables d'environnement pour TMDB et Supabase.

### 2. Page de test (`src/app/test/page.tsx`)
Page pour tester les connexions TMDB et Supabase.

## 🔑 Configuration

### TMDB (The Movie Database)

1. Créez un compte sur [TMDB](https://www.themoviedb.org/)
2. Allez dans [Paramètres > API](https://www.themoviedb.org/settings/api)
3. Demandez une clé API (c'est gratuit)
4. Copiez votre clé API dans le fichier `.env.local` :
   ```
   NEXT_PUBLIC_TMDB_API_KEY=votre_clé_api_ici
   ```

### Supabase

1. Créez un compte sur [Supabase](https://supabase.com/)
2. Créez un nouveau projet
3. Allez dans Settings > API
4. Copiez l'URL et la clé anon/public dans `.env.local` :
   ```
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
   ```

## 🧪 Tester la connexion

1. Configurez vos clés API dans `.env.local`
2. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
3. Visitez : [http://localhost:3000/test](http://localhost:3000/test)
4. Cliquez sur les boutons "Tester" pour vérifier les connexions

## ⚠️ Important

- Le fichier `.env.local` ne doit **jamais** être commité sur Git (il est dans `.gitignore`)
- Utilisez `.env.example` comme template pour partager la configuration sans exposer vos clés
