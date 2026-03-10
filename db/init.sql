-- ═══════════════════════════════════════════════════════════
-- Taranoid — PostgreSQL Veritabanı Şeması
-- Sprint 2 — Analiz geçmişi, skor kayıtları, metrikler
-- ═══════════════════════════════════════════════════════════

-- Extension'lar
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- metin arama için


-- ─── 1. Token Metadata ────────────────────────────────────
CREATE TABLE IF NOT EXISTS tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address         VARCHAR(64) UNIQUE NOT NULL,
    name            VARCHAR(128),
    symbol          VARCHAR(32),
    supply          NUMERIC(38, 0) DEFAULT 0,
    decimals        SMALLINT DEFAULT 0,
    creator_wallet  VARCHAR(64),
    platform        VARCHAR(32) DEFAULT 'unknown',  -- pump_fun, raydium, orca
    created_at      TIMESTAMPTZ,
    first_seen_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tokens_address ON tokens(address);
CREATE INDEX IF NOT EXISTS idx_tokens_symbol ON tokens(symbol);
CREATE INDEX IF NOT EXISTS idx_tokens_creator ON tokens(creator_wallet);
CREATE INDEX IF NOT EXISTS idx_tokens_platform ON tokens(platform);


-- ─── 2. Analiz Sonuçları (Ana Tablo) ─────────────────────
CREATE TABLE IF NOT EXISTS analyses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_address   VARCHAR(64) NOT NULL REFERENCES tokens(address) ON DELETE CASCADE,
    
    -- Birleşik skor
    total_score     NUMERIC(5, 2) NOT NULL,      -- 0.00 – 100.00
    risk_level      VARCHAR(16) NOT NULL,         -- SAFE, LOW, MEDIUM, HIGH, CRITICAL
    scoring_version VARCHAR(8) DEFAULT 'v2',      -- v1, v2
    
    -- Sprint 1 Metrikleri
    vlr_value       NUMERIC(12, 2) DEFAULT 0,
    vlr_score       NUMERIC(5, 2) DEFAULT 0,
    rls_value       NUMERIC(12, 2) DEFAULT 0,
    rls_score       NUMERIC(5, 2) DEFAULT 0,
    holder_count    INTEGER DEFAULT 0,
    holder_score    NUMERIC(5, 2) DEFAULT 0,
    top10_pct       NUMERIC(6, 4) DEFAULT 0,      -- 0.0000 – 1.0000
    
    -- Sprint 2 Metrikleri
    cluster_score   NUMERIC(5, 2) DEFAULT 0,
    wash_score      NUMERIC(5, 2) DEFAULT 0,
    sybil_score     NUMERIC(5, 2) DEFAULT 0,
    bundler_score   NUMERIC(5, 2) DEFAULT 0,
    exit_score      NUMERIC(5, 2) DEFAULT 0,
    curve_score     NUMERIC(5, 2) DEFAULT 0,
    
    -- Piyasa verisi snapshot
    price_usd       NUMERIC(24, 12) DEFAULT 0,
    volume_24h_usd  NUMERIC(18, 2) DEFAULT 0,
    liquidity_usd   NUMERIC(18, 2) DEFAULT 0,
    mcap_usd        NUMERIC(18, 2) DEFAULT 0,
    dex_source      VARCHAR(32),
    
    -- Uyarılar (JSON array)
    warnings        JSONB DEFAULT '[]'::jsonb,
    
    -- Zaman
    analyzed_at     TIMESTAMPTZ DEFAULT NOW(),
    
    -- Soft delete
    is_deleted      BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_analyses_token ON analyses(token_address);
CREATE INDEX IF NOT EXISTS idx_analyses_time ON analyses(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_score ON analyses(total_score);
CREATE INDEX IF NOT EXISTS idx_analyses_level ON analyses(risk_level);
CREATE INDEX IF NOT EXISTS idx_analyses_token_time ON analyses(token_address, analyzed_at DESC);


-- ─── 3. Cluster Detayları ─────────────────────────────────
CREATE TABLE IF NOT EXISTS analysis_clusters (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id     UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    cluster_id      VARCHAR(32) NOT NULL,
    wallet_count    INTEGER DEFAULT 0,
    pct_supply      NUMERIC(6, 4) DEFAULT 0,
    root_wallet     VARCHAR(64),
    funding_sources INTEGER DEFAULT 1,
    avg_age_hrs     NUMERIC(10, 2) DEFAULT 0,
    similarity      NUMERIC(4, 3) DEFAULT 0,      -- 0.000 – 1.000
    wallets         JSONB DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clusters_analysis ON analysis_clusters(analysis_id);


-- ─── 4. Wash Trading Detayları ────────────────────────────
CREATE TABLE IF NOT EXISTS analysis_wash (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id         UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    cycles_found        INTEGER DEFAULT 0,
    cycle_volume_usd    NUMERIC(18, 2) DEFAULT 0,
    total_volume_usd    NUMERIC(18, 2) DEFAULT 0,
    same_amount_pairs   INTEGER DEFAULT 0,
    rapid_pairs         INTEGER DEFAULT 0,
    unique_wallets      INTEGER DEFAULT 0,
    total_tx_count      INTEGER DEFAULT 0,
    cycle_details       JSONB DEFAULT '[]'::jsonb,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wash_analysis ON analysis_wash(analysis_id);


-- ─── 5. Bundler Detayları ─────────────────────────────────
CREATE TABLE IF NOT EXISTS analysis_bundler (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id             UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    detected                BOOLEAN DEFAULT FALSE,
    bundle_count            INTEGER DEFAULT 0,
    max_recipients_in_slot  INTEGER DEFAULT 0,
    total_distributed       NUMERIC(38, 0) DEFAULT 0,
    pct_supply_distributed  NUMERIC(6, 4) DEFAULT 0,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bundler_analysis ON analysis_bundler(analysis_id);


-- ─── 6. Trending / Popüler Tokenlar ──────────────────────
CREATE TABLE IF NOT EXISTS trending_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_address   VARCHAR(64) NOT NULL,
    name            VARCHAR(128),
    symbol          VARCHAR(32),
    total_score     NUMERIC(5, 2) DEFAULT 0,
    risk_level      VARCHAR(16),
    volume_24h_usd  NUMERIC(18, 2) DEFAULT 0,
    mcap_usd        NUMERIC(18, 2) DEFAULT 0,
    query_count     INTEGER DEFAULT 1,           -- kaç kez sorgulandı
    last_queried_at TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trending_address ON trending_tokens(token_address);
CREATE INDEX IF NOT EXISTS idx_trending_queries ON trending_tokens(query_count DESC);
CREATE INDEX IF NOT EXISTS idx_trending_score ON trending_tokens(total_score DESC);


-- ─── 7. API İstek Logları ─────────────────────────────────
CREATE TABLE IF NOT EXISTS api_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint        VARCHAR(128) NOT NULL,
    token_address   VARCHAR(64),
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(256),
    response_ms     INTEGER DEFAULT 0,            -- yanıt süresi (ms)
    status_code     SMALLINT DEFAULT 200,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_time ON api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_token ON api_logs(token_address);

-- Otomatik partition (aylık) — büyük tablolar için
-- CREATE TABLE api_logs_2026_03 PARTITION OF api_logs
--     FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');


-- ─── 8. Yardımcı Fonksiyonlar ─────────────────────────────

-- Otomatik updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tokens_updated
    BEFORE UPDATE ON tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trending token upsert fonksiyonu
CREATE OR REPLACE FUNCTION upsert_trending(
    p_address VARCHAR(64),
    p_name VARCHAR(128),
    p_symbol VARCHAR(32),
    p_score NUMERIC(5,2),
    p_level VARCHAR(16),
    p_volume NUMERIC(18,2),
    p_mcap NUMERIC(18,2)
) RETURNS VOID AS $$
BEGIN
    INSERT INTO trending_tokens (token_address, name, symbol, total_score, risk_level, volume_24h_usd, mcap_usd, query_count)
    VALUES (p_address, p_name, p_symbol, p_score, p_level, p_volume, p_mcap, 1)
    ON CONFLICT (token_address) DO UPDATE SET
        name = EXCLUDED.name,
        symbol = EXCLUDED.symbol,
        total_score = EXCLUDED.total_score,
        risk_level = EXCLUDED.risk_level,
        volume_24h_usd = EXCLUDED.volume_24h_usd,
        mcap_usd = EXCLUDED.mcap_usd,
        query_count = trending_tokens.query_count + 1,
        last_queried_at = NOW();
END;
$$ LANGUAGE plpgsql;


-- ─── 9. Örnek View'lar ───────────────────────────────────

-- Son 24 saatteki en riskli tokenlar
CREATE OR REPLACE VIEW v_risky_tokens_24h AS
SELECT
    t.address,
    t.name,
    t.symbol,
    a.total_score,
    a.risk_level,
    a.vlr_value,
    a.cluster_score,
    a.wash_score,
    a.volume_24h_usd,
    a.mcap_usd,
    a.analyzed_at
FROM analyses a
JOIN tokens t ON t.address = a.token_address
WHERE a.analyzed_at > NOW() - INTERVAL '24 hours'
  AND a.is_deleted = FALSE
ORDER BY a.total_score DESC;

-- En çok sorgulanan tokenlar
CREATE OR REPLACE VIEW v_most_queried AS
SELECT
    token_address,
    name,
    symbol,
    total_score,
    risk_level,
    volume_24h_usd,
    query_count,
    last_queried_at
FROM trending_tokens
ORDER BY query_count DESC
LIMIT 50;


-- ─── 10. Kullanıcı Tablosu (Telegram Bot) ────────────────
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    telegram_id     BIGINT UNIQUE,
    username        VARCHAR(50),
    tier            VARCHAR(10) DEFAULT 'free',    -- free, pro, trader
    watchlist       VARCHAR(64)[] DEFAULT '{}',
    daily_queries   INTEGER DEFAULT 0,
    last_query_date DATE DEFAULT CURRENT_DATE,
    api_key         VARCHAR(64),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);


-- ─── 11. Referral Sistemi (Sprint 3) ────────────────────
CREATE TABLE IF NOT EXISTS referrals (
    id            SERIAL PRIMARY KEY,
    referrer_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    referred_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ref_code      VARCHAR(20) NOT NULL,
    converted     BOOLEAN DEFAULT FALSE,   -- referred kullanıcı analiz yaptı mı
    reward_given  BOOLEAN DEFAULT FALSE,   -- ödül verildi mi
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(ref_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);

-- users tablosuna referral sütunları ekle (IF NOT EXISTS benzeri)
DO $$ BEGIN
    ALTER TABLE users ADD COLUMN ref_code VARCHAR(20) UNIQUE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE users ADD COLUMN referred_by VARCHAR(20);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE users ADD COLUMN bonus_until DATE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
    ALTER TABLE users ADD COLUMN total_referrals INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;


-- ─── 12. API Key Yönetimi (Sprint 3) ────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
    key_id       VARCHAR(64) PRIMARY KEY,              -- cg_live_<32hex>
    user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
    telegram_id  BIGINT NOT NULL,
    name         VARCHAR(50) NOT NULL DEFAULT 'API Key',
    tier         VARCHAR(10) DEFAULT 'free',           -- free, pro, trader
    daily_limit  INTEGER DEFAULT 100,
    daily_used   INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    last_reset   DATE DEFAULT CURRENT_DATE,
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_telegram ON api_keys(telegram_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);


-- ─── 12. Affiliate Tıklama Takibi ────────────────────────
CREATE TABLE IF NOT EXISTS affiliate_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    telegram_id     BIGINT,
    exchange        VARCHAR(20) NOT NULL,          -- binance, okx, bybit, gate
    ref_code        VARCHAR(50),
    click_source    VARCHAR(20) DEFAULT 'web',     -- web, telegram, api
    token_address   VARCHAR(64),                    -- hangi token analizinden geldi
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(256),
    clicked_at      TIMESTAMPTZ DEFAULT NOW(),
    converted       BOOLEAN DEFAULT FALSE,
    conversion_at   TIMESTAMPTZ,
    commission      NUMERIC(10, 2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_affiliate_exchange ON affiliate_events(exchange);
CREATE INDEX IF NOT EXISTS idx_affiliate_source ON affiliate_events(click_source);
CREATE INDEX IF NOT EXISTS idx_affiliate_token ON affiliate_events(token_address);
CREATE INDEX IF NOT EXISTS idx_affiliate_time ON affiliate_events(clicked_at DESC);

-- Affiliate özet view
CREATE OR REPLACE VIEW v_affiliate_summary AS
SELECT
    exchange,
    click_source,
    COUNT(*) AS total_clicks,
    SUM(CASE WHEN converted THEN 1 ELSE 0 END) AS conversions,
    ROUND(SUM(CASE WHEN converted THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) AS conversion_rate,
    SUM(commission) AS total_commission
FROM affiliate_events
GROUP BY exchange, click_source
ORDER BY total_clicks DESC;
