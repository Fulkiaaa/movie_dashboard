-- Schema pour la base de données Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Table pour stocker les films/séries de l'utilisateur
CREATE TABLE IF NOT EXISTS user_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type VARCHAR(10) NOT NULL, -- 'movie' ou 'tv'
  title VARCHAR(500) NOT NULL,
  poster_path VARCHAR(500),
  release_date VARCHAR(50),
  
  -- Statut du film
  status VARCHAR(20) NOT NULL, -- 'watched', 'watchlist'
  
  -- Rating personnel (1-5)
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte pour éviter les doublons
  UNIQUE(user_id, tmdb_id, media_type)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_movies_user_id ON user_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_movies_status ON user_movies(status);
CREATE INDEX IF NOT EXISTS idx_user_movies_rating ON user_movies(rating);

-- Activer Row Level Security (RLS)
ALTER TABLE user_movies ENABLE ROW LEVEL SECURITY;

-- Politique RLS : Les utilisateurs ne peuvent voir que leurs propres données
CREATE POLICY "Users can view their own movies"
  ON user_movies
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique RLS : Les utilisateurs peuvent insérer leurs propres données
CREATE POLICY "Users can insert their own movies"
  ON user_movies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique RLS : Les utilisateurs peuvent mettre à jour leurs propres données
CREATE POLICY "Users can update their own movies"
  ON user_movies
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique RLS : Les utilisateurs peuvent supprimer leurs propres données
CREATE POLICY "Users can delete their own movies"
  ON user_movies
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_user_movies_updated_at
  BEFORE UPDATE ON user_movies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
