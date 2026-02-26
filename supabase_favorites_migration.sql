-- Migration pour ajouter le système de favoris
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter la colonne is_favorite
ALTER TABLE user_movies 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_movies_is_favorite ON user_movies(user_id, is_favorite) 
WHERE is_favorite = TRUE;

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
