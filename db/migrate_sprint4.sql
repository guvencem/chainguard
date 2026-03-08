-- Sprint 4 Migration — Pro Subscription + WebSocket altyapısı
-- Railway PostgreSQL Console'dan çalıştır

-- users tablosuna pro abonelik sütunları
DO $$ BEGIN ALTER TABLE users ADD COLUMN pro_until TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE users ADD COLUMN stars_charge_id VARCHAR(64); EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- payments tablosu — ödeme geçmişi
CREATE TABLE IF NOT EXISTS payments (
    id              SERIAL PRIMARY KEY,
    telegram_id     BIGINT NOT NULL,
    charge_id       VARCHAR(64) NOT NULL UNIQUE,
    payload         VARCHAR(100) NOT NULL,
    amount          INTEGER NOT NULL,        -- Stars miktarı
    currency        VARCHAR(10) DEFAULT 'XTR',
    status          VARCHAR(20) DEFAULT 'completed',
    pro_until       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_telegram ON payments(telegram_id);
CREATE INDEX IF NOT EXISTS idx_payments_charge ON payments(charge_id);

SELECT 'Sprint 4 migration tamamlandi' AS status;
