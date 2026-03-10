-- ═══════════════════════════════════════════════════════════
-- Taranoid — Sprint 1 Veritabanı Şeması
-- TimescaleDB uzantısı ile zaman serisi desteği
-- ═══════════════════════════════════════════════════════════

-- TimescaleDB uzantısını etkinleştir
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ── tokens ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tokens (
    address        VARCHAR(44) PRIMARY KEY,
    name           VARCHAR(100),
    symbol         VARCHAR(20),
    supply         NUMERIC(30,0),
    decimals       INTEGER,
    creator_wallet VARCHAR(44),
    platform       VARCHAR(20),   -- pump_fun, raydium, orca
    created_at     TIMESTAMPTZ,
    first_seen     TIMESTAMPTZ DEFAULT NOW(),
    last_updated   TIMESTAMPTZ DEFAULT NOW()
);

-- ── token_scores (TimescaleDB hypertable) ──────────────────
CREATE TABLE IF NOT EXISTS token_scores (
    token_address  VARCHAR(44) REFERENCES tokens(address),
    timestamp      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    vlr_score      NUMERIC(5,2),    -- 0-100
    rls_score      NUMERIC(5,2),    -- 0-100
    holder_score   NUMERIC(5,2),    -- 0-100
    total_score    NUMERIC(5,2),    -- ağırlıklı ortalama
    vlr_raw        NUMERIC(10,2),   -- ham VLR değeri (362x gibi)
    liquidity_usd  NUMERIC(12,2),   -- havuzdaki gerçek USD
    volume_24h_usd NUMERIC(14,2),   -- 24s hacim
    mcap_usd       NUMERIC(14,2),   -- market cap
    holder_count   INTEGER,
    active_holders INTEGER,
    PRIMARY KEY (token_address, timestamp)
);

SELECT create_hypertable('token_scores', 'timestamp', if_not_exists => TRUE);

-- ── holders ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS holders (
    wallet_address VARCHAR(44),
    token_address  VARCHAR(44) REFERENCES tokens(address),
    balance        NUMERIC(30,0),
    pct_supply     NUMERIC(7,4),
    first_buy      TIMESTAMPTZ,
    last_active    TIMESTAMPTZ,
    tx_count       INTEGER,
    PRIMARY KEY (wallet_address, token_address)
);

-- ── transactions (TimescaleDB hypertable) ──────────────────
CREATE TABLE IF NOT EXISTS transactions (
    signature      VARCHAR(88),
    token_address  VARCHAR(44),
    from_wallet    VARCHAR(44),
    to_wallet      VARCHAR(44),
    amount         NUMERIC(30,0),
    amount_usd     NUMERIC(12,2),
    tx_type        VARCHAR(10),     -- buy, sell, transfer
    slot           BIGINT,
    timestamp      TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (signature, timestamp)
);

SELECT create_hypertable('transactions', 'timestamp', if_not_exists => TRUE);

-- ── İndeksler ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_scores_token ON token_scores(token_address, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_holders_token ON holders(token_address);
CREATE INDEX IF NOT EXISTS idx_tx_token ON transactions(token_address, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_tx_wallet ON transactions(from_wallet, timestamp DESC);

-- ── Durum bildirimi ────────────────────────────────────────
DO $$
BEGIN
    RAISE NOTICE '✅ Taranoid Sprint 1 şeması başarıyla oluşturuldu.';
END $$;
