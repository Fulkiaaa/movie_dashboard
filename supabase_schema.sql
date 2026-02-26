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
  
  -- Favori (max 10)
  is_favorite BOOLEAN DEFAULT FALSE,
  
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
CREATE INDEX IF NOT EXISTS idx_user_movies_is_favorite ON user_movies(user_id, is_favorite) 
WHERE is_favorite = TRUE;

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

-- Fonction pour vérifier la limite de 10 favoris
CREATE OR REPLACE FUNCTION check_favorites_limit()
RETURNS TRIGGER AS $$
DECLARE
  favorites_count INTEGER;
BEGIN
  -- Si on essaie de mettre is_favorite à TRUE
  IF NEW.is_favorite = TRUE THEN
    -- Compter le nombre de favoris actuels pour l'utilisateur
    SELECT COUNT(*) INTO favorites_count
    FROM user_movies
    WHERE user_id = NEW.user_id 
      AND is_favorite = TRUE 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
    
    -- Si déjà 10 favoris, empêcher l'ajout
    IF favorites_count >= 10 THEN
      RAISE EXCEPTION 'Vous ne pouvez avoir que 10 films favoris maximum';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour vérifier la limite lors de l'insertion
DROP TRIGGER IF EXISTS check_favorites_limit_insert ON user_movies;
CREATE TRIGGER check_favorites_limit_insert
  BEFORE INSERT ON user_movies
  FOR EACH ROW
  EXECUTE FUNCTION check_favorites_limit();

-- Créer le trigger pour vérifier la limite lors de la mise à jour
DROP TRIGGER IF EXISTS check_favorites_limit_update ON user_movies;
CREATE TRIGGER check_favorites_limit_update
  BEFORE UPDATE ON user_movies
  FOR EACH ROW
  WHEN (NEW.is_favorite IS DISTINCT FROM OLD.is_favorite)
  EXECUTE FUNCTION check_favorites_limit();
