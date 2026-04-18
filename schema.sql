-- Schéma PostgreSQL pour Movie Dashboard
-- À exécuter dans DBeaver sur ta base de données locale

-- Table des utilisateurs (remplace auth.users de Supabase)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  gdpr_consent_date          TIMESTAMPTZ,
  gdpr_restrict_processing   BOOLEAN DEFAULT FALSE NOT NULL,
  gdpr_opt_out_automated     BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour stocker les films/séries de l'utilisateur
CREATE TABLE IF NOT EXISTS user_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title VARCHAR(500) NOT NULL,
  poster_path VARCHAR(500),
  release_date VARCHAR(50),
  status VARCHAR(20) NOT NULL CHECK (status IN ('watched', 'watchlist')),
  rating NUMERIC(3,1) CHECK (rating >= 0 AND rating <= 5 AND MOD(rating * 2, 1) = 0),
  is_favorite BOOLEAN DEFAULT FALSE,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id, media_type)
);

-- Table des films skippés dans le swipe
CREATE TABLE IF NOT EXISTS skipped_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id, media_type)
);

-- Table des abonnements
CREATE TABLE IF NOT EXISTS subscriptions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan         VARCHAR(20) NOT NULL DEFAULT 'free'
                 CHECK (plan IN ('free', 'pro', 'pro_annual')),
  status       VARCHAR(20) NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'trialing', 'cancelled', 'expired')),
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  -- Prêt pour Stripe : stocker l'ID de subscription externe
  stripe_subscription_id VARCHAR(255),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Migration : ajouter la table si elle n'existe pas encore
-- (déjà géré par CREATE TABLE IF NOT EXISTS ci-dessus)

-- Index
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON subscriptions(user_id, status);

-- Listes personnalisées
CREATE TABLE IF NOT EXISTS user_lists (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  is_public   BOOLEAN DEFAULT FALSE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS list_movies (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id      UUID REFERENCES user_lists(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tmdb_id      INTEGER NOT NULL,
  media_type   VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title        VARCHAR(500) NOT NULL,
  poster_path  VARCHAR(500),
  release_date VARCHAR(50),
  added_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, tmdb_id, media_type)
);

CREATE INDEX IF NOT EXISTS idx_user_lists_user_id    ON user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_list_movies_list_id   ON list_movies(list_id);
CREATE INDEX IF NOT EXISTS idx_list_movies_user_tmdb ON list_movies(user_id, tmdb_id, media_type);

CREATE OR REPLACE TRIGGER update_user_lists_updated_at
  BEFORE UPDATE ON user_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index
CREATE INDEX IF NOT EXISTS idx_user_movies_user_id ON user_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_movies_status ON user_movies(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_movies_is_favorite ON user_movies(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_skipped_movies_user_id ON skipped_movies(user_id);

-- Trigger updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_movies_updated_at
  BEFORE UPDATE ON user_movies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger limite 10 favoris
CREATE OR REPLACE FUNCTION check_favorites_limit()
RETURNS TRIGGER AS $$
DECLARE
  favorites_count INTEGER;
BEGIN
  IF NEW.is_favorite = TRUE THEN
    SELECT COUNT(*) INTO favorites_count
    FROM user_movies
    WHERE user_id = NEW.user_id
      AND is_favorite = TRUE
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

    IF favorites_count >= 10 THEN
      RAISE EXCEPTION 'Vous ne pouvez avoir que 10 films favoris maximum';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_favorites_limit_insert
  BEFORE INSERT ON user_movies
  FOR EACH ROW EXECUTE FUNCTION check_favorites_limit();

CREATE OR REPLACE TRIGGER check_favorites_limit_update
  BEFORE UPDATE ON user_movies
  FOR EACH ROW
  WHEN (NEW.is_favorite IS DISTINCT FROM OLD.is_favorite)
  EXECUTE FUNCTION check_favorites_limit();
