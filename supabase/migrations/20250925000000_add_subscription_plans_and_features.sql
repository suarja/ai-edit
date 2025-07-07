-- Migration pour ajouter le support des plans d'abonnement et des fonctionnalités
-- 1. Mise à jour de la table user_usage pour suivre plusieurs types de ressources
ALTER TABLE user_usage
ADD COLUMN IF NOT EXISTS source_videos_limit INTEGER NOT NULL DEFAULT 3,
    ADD COLUMN IF NOT EXISTS voice_clones_limit INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS account_analysis_limit INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS source_videos_used INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS voice_clones_used INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS account_analysis_used INTEGER NOT NULL DEFAULT 0;
-- 2. Création d'une table pour les plans d'abonnement
CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price_monthly NUMERIC NOT NULL,
    price_yearly NUMERIC NOT NULL,
    videos_limit INTEGER NOT NULL,
    source_videos_limit INTEGER NOT NULL,
    voice_clones_limit INTEGER NOT NULL,
    account_analysis_limit INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- 3. Création d'une table pour les fonctionnalités (feature flags)
CREATE TABLE IF NOT EXISTS feature_flags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    required_plan TEXT REFERENCES subscription_plans(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- 4. Insertion des plans de base
INSERT INTO subscription_plans (
        id,
        name,
        description,
        price_monthly,
        price_yearly,
        videos_limit,
        source_videos_limit,
        voice_clones_limit,
        account_analysis_limit
    )
VALUES (
        'free',
        'Free Tier',
        'Plan gratuit avec fonctionnalités limitées',
        0,
        0,
        3,
        30,
        0,
        0
    ),
    (
        'pro',
        'Pro',
        'Plan professionnel avec toutes les fonctionnalités',
        9.99,
        99.99,
        30,
        999999,
        1,
        1
    );
-- 5. Insertion des fonctionnalités
INSERT INTO feature_flags (id, name, description, required_plan)
VALUES (
        'voice_clone',
        'Clonage Vocal',
        'Créer un clone de votre voix pour la narration',
        'pro'
    ),
    (
        'account_analysis',
        'Analyse de Compte',
        'Analyse approfondie de votre compte TikTok',
        'pro'
    ),
    (
        'high_quality_export',
        'Export Haute Qualité',
        'Export de vidéos en haute qualité',
        'pro'
    );
-- 6. Mise à jour des utilisateurs existants avec les nouvelles limites
-- Pour les utilisateurs Free
UPDATE user_usage
SET source_videos_limit = 30,
    voice_clones_limit = 0,
    account_analysis_limit = 0
WHERE videos_limit <= 5;
-- Supposons que les utilisateurs avec une limite de 5 ou moins sont en plan gratuit
-- Pour les utilisateurs Pro
UPDATE user_usage
SET source_videos_limit = 999999,
    voice_clones_limit = 1,
    account_analysis_limit = 1
WHERE videos_limit > 5;
-- Supposons que les utilisateurs avec une limite supérieure à 5 sont en plan Pro
-- 7. Activer RLS sur les nouvelles tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
-- 8. Ajouter des politiques RLS pour les nouvelles tables
-- Tout le monde peut lire les plans d'abonnement
CREATE POLICY "Anyone can read subscription plans" ON subscription_plans FOR
SELECT USING (true);
-- Seuls les admins peuvent modifier les plans d'abonnement
CREATE POLICY "Only admins can modify subscription plans" ON subscription_plans FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
            AND role = 'admin'
    )
);
-- Tout le monde peut lire les fonctionnalités
CREATE POLICY "Anyone can read feature flags" ON feature_flags FOR
SELECT USING (true);
-- Seuls les admins peuvent modifier les fonctionnalités
CREATE POLICY "Only admins can modify feature flags" ON feature_flags FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
            AND role = 'admin'
    )
);
-- 9. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans (is_active);
CREATE INDEX IF NOT EXISTS idx_feature_flags_required_plan ON feature_flags (required_plan);
CREATE INDEX IF NOT EXISTS idx_feature_flags_is_active ON feature_flags (is_active);
-- 10. Ajouter des commentaires pour la documentation
COMMENT ON TABLE subscription_plans IS 'Plans d''abonnement disponibles dans l''application';
COMMENT ON TABLE feature_flags IS 'Fonctionnalités qui peuvent être activées/désactivées et liées à des plans';
COMMENT ON COLUMN user_usage.source_videos_limit IS 'Nombre maximum de vidéos sources que l''utilisateur peut uploader';
COMMENT ON COLUMN user_usage.voice_clones_limit IS 'Nombre maximum de clones vocaux que l''utilisateur peut créer';
COMMENT ON COLUMN user_usage.account_analysis_limit IS 'Nombre maximum d''analyses de compte que l''utilisateur peut effectuer';