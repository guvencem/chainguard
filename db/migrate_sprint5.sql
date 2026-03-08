-- Sprint 5 Migration — Wallet Connect + Holder Verification + Token Tiers
-- API startup'ta otomatik çalışır

-- Wallet bağlantıları tablosu
CREATE TABLE IF NOT EXISTS wallet_connections (
    id              SERIAL PRIMARY KEY,
    wallet_address  VARCHAR(44) NOT NULL UNIQUE,
    telegram_id     BIGINT REFERENCES users(telegram_id) ON DELETE SET NULL,
    user_email      VARCHAR(100),                    -- web kullanıcıları için
    signature       VARCHAR(256) NOT NULL,           -- kanıt imzası
    message         VARCHAR(256) NOT NULL,           -- imzalanan mesaj
    chain           VARCHAR(20)  DEFAULT 'solana',
    ip_address      VARCHAR(45),
    verified_at     TIMESTAMPTZ  DEFAULT NOW(),
    last_checked    TIMESTAMPTZ  DEFAULT NOW(),
    is_active       BOOLEAN      DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_wallet_telegram    ON wallet_connections(telegram_id);
CREATE INDEX IF NOT EXISTS idx_wallet_address     ON wallet_connections(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_ip          ON wallet_connections(ip_address);

-- Token bakiye geçmişi (fraud tespiti için)
CREATE TABLE IF NOT EXISTS wallet_balances (
    id              SERIAL PRIMARY KEY,
    wallet_address  VARCHAR(44) NOT NULL,
    token_address   VARCHAR(44) NOT NULL,
    balance         NUMERIC(30,0) DEFAULT 0,
    usd_value       NUMERIC(14,4) DEFAULT 0,
    checked_at      TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_balance_wallet ON wallet_balances(wallet_address);

-- users tablosuna holder tier sütunları
DO $$ BEGIN ALTER TABLE users ADD COLUMN wallet_address VARCHAR(44); EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE users ADD COLUMN holder_tier VARCHAR(20) DEFAULT 'free'; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE users ADD COLUMN holder_verified_at TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE users ADD COLUMN token_usd_value NUMERIC(10,4) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- CGT token adresi config (başlatıldıktan sonra güncelle)
CREATE TABLE IF NOT EXISTS platform_config (
    key     VARCHAR(50) PRIMARY KEY,
    value   TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO platform_config (key, value) VALUES
    ('cgt_token_address', 'TBA'),
    ('cgt_holder_min_usd', '5'),
    ('pro_monthly_usd', '29'),
    ('trader_monthly_usd', '99'),
    ('treasury_wallet', 'TBA')
ON CONFLICT (key) DO NOTHING;

SELECT 'Sprint 5 migration tamamlandi' AS status;
