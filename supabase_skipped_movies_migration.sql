-- Migration pour créer la table des films skippés/ignorés dans le swipe
-- À exécuter dans Supabase SQL Editor

-- Créer la table skipped_movies
CREATE TABLE IF NOT EXISTS skipped_movies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Contrainte unique pour éviter les doublons
  UNIQUE(user_id, tmdb_id, media_type)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_skipped_movies_user_id ON skipped_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_skipped_movies_tmdb_id ON skipped_movies(tmdb_id);

-- Activer Row Level Security
ALTER TABLE skipped_movies ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir uniquement leurs films skippés
CREATE POLICY "Users can view their own skipped movies"
  ON skipped_movies
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs d'ajouter leurs films skippés
CREATE POLICY "Users can insert their own skipped movies"
  ON skipped_movies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer leurs films skippés
CREATE POLICY "Users can delete their own skipped movies"
  ON skipped_movies
  FOR DELETE
  USING (auth.uid() = user_id);

-- Commentaires
COMMENT ON TABLE skipped_movies IS 'Films ignorés/skippés par les utilisateurs dans le swipe';
COMMENT ON COLUMN skipped_movies.user_id IS 'ID de l''utilisateur';
COMMENT ON COLUMN skipped_movies.tmdb_id IS 'ID du film dans TMDB';
COMMENT ON COLUMN skipped_movies.media_type IS 'Type de média (movie ou tv)';
