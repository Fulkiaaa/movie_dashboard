# Instructions pour activer la fonctionnalité Swipe

## 1. Migration de la base de données

Avant de pouvoir utiliser la fonctionnalité swipe, vous devez créer la table `skipped_movies` dans Supabase :

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (dans le menu de gauche)
4. Cliquez sur **New query**
5. Copiez et collez le contenu du fichier `supabase_skipped_movies_migration.sql`
6. Cliquez sur **Run** pour exécuter la migration

## 2. Fonctionnalités implémentées

### Page Swipe (/swipe)

Interface style Tinder pour découvrir des films :

**Affichage :**
- Uniquement l'affiche du film avec le titre en overlay
- Pas de date de sortie, pas de description
- Design moderne avec animations fluides

**Sources de films :**
- Films populaires (Popular Movies)
- Films les mieux notés (Top Rated Movies) 
- Séries populaires (Popular TV)
- Séries les mieux notées (Top Rated TV)
- Films tendance de la semaine (Trending)

**3 actions disponibles :**

1. **❌ Dislike (Bouton rouge)** : 
   - Passe le film
   - Enregistre dans `skipped_movies` pour ne jamais le reproposer
   
2. **🔖 Watchlist (Bouton bleu)** :
   - Ajoute à la liste "À voir"
   - Le film ne sera plus proposé dans le swipe
   
3. **❤️ Like (Bouton rose/rouge)** :
   - Marque le film comme "Vu"
   - Ouvre une modal de notation (1-5 étoiles)
   - Option "Noter plus tard" : ajoute aux films vus sans note (modifiable dans la liste "Vus")

### Système d'exclusion intelligent

Les films ne sont **jamais reproposés** s'ils ont été :
- Ajoutés à la watchlist
- Marqués comme vus
- Skippés/Disliked

### Chargement automatique

- Mélange intelligent de différentes catégories
- Chargement automatique de nouveaux films quand la pile diminue
- Plus de 100 films disponibles dès le début

## 3. Services ajoutés

### moviesService (src/services/movies.ts)

Nouvelles méthodes :
- `addSkippedMovie()` : Ajouter un film à la liste des films skippés
- `getSkippedMovieIds()` : Récupérer tous les IDs de films skippés
- `removeSkippedMovie()` : Supprimer un film de la liste des skippés

### tmdbService (src/services/tmdb.ts)

Nouvelle méthode :
- `getTopRatedTV()` : Récupérer les séries les mieux notées

## 4. Structure de la table skipped_movies

```sql
CREATE TABLE skipped_movies (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  tmdb_id INTEGER NOT NULL,
  media_type TEXT CHECK (media_type IN ('movie', 'tv')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tmdb_id, media_type)
);
```

## 5. Workflow utilisateur

1. L'utilisateur arrive sur `/swipe`
2. Il voit une affiche de film/série
3. Il choisit une action :
   - **Dislike** → Passé, ne sera plus proposé
   - **Watchlist** → Va dans "À voir", accessible depuis le dashboard
   - **Like** → Modal s'ouvre pour noter de 1 à 5 étoiles
4. Si notation :
   - Choix : Noter maintenant ou "Noter plus tard"
   - Si "Noter plus tard" : film ajouté aux "Vus" sans note
   - La note peut être ajoutée/modifiée plus tard via la recherche globale ou la liste "Vus"
5. Le film suivant apparaît automatiquement

## 6. Prochaines améliorations possibles

- Gestures de swipe (drag & drop)
- Statistiques de swipe (X films vus, Y films skippés)
- Filtres par genre
- Mode "Revoir les films skippés"
- Animations plus avancées avec Framer Motion
