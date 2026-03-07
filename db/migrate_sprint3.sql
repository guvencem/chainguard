-- Sprint 3 Migration — Referral + API Keys
-- Railway PostgreSQL Console'dan çalıştır

-- Referrals tablosu
CREATE TABLE IF NOT EXISTS referrals (
    id            SERIAL PRIMARY KEY,
    referrer_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    referred_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ref_code      VARCHAR(20) NOT NULL,
    converted     BOOLEAN DEFAULT FALSE,
    reward_given  BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(ref_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);

-- users tablosuna referral sütunları
DO $$ BEGIN ALTER TABLE users ADD COLUMN ref_code VARCHAR(20) UNIQUE; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE users ADD COLUMN referred_by VARCHAR(20); EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE users ADD COLUMN bonus_until DATE; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE users ADD COLUMN total_referrals INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- API Keys tablosu
CREATE TABLE IF NOT EXISTS api_keys (
    key_id       VARCHAR(64) PRIMARY KEY,
    user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
    telegram_id  BIGINT NOT NULL,
    name         VARCHAR(50) NOT NULL DEFAULT 'API Key',
    tier         VARCHAR(10) DEFAULT 'free',
    daily_limit  INTEGER DEFAULT 100,
    daily_used   INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    last_reset   DATE DEFAULT CURRENT_DATE,
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_keys_telegram ON api_keys(telegram_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

SELECT 'Sprint 3 migration tamamlandi' AS status;
