# ChainGuard

**Solana, Base ve BSC token risk analiz platformu**

Token adresini gir — saniyeler içinde 9 metrikle risk skorunu al. Türkçe AI rapor, cüzdan küme analizi, wash trading tespiti.

## Özellikler

- **9 Metrik Analiz** — VLR, RLS, Holder, Kümeleme, Wash Trading, Sybil, Bundler, Exit, Curve
- **Çoklu Zincir** — Solana, Base, BSC ve tüm EVM uyumlu zincirler
- **AI Türkçe Rapor** — 9 metriğe göre otomatik Türkçe analiz özeti
- **Creator Profiling** — Token yaratıcısının geçmiş rug oranı
- **Telegram Bot** — /analyze, /watch, watchlist uyarıları, Pro abonelik (Telegram Stars)
- **API Erişimi** — REST API + WebSocket gerçek zamanlı uyarılar
- **Eğitim Merkezi** — Wash trading, cüzdan kümeleme, PIPPINU vaka analizi

## Servisler

| Servis | Platform | URL |
|--------|----------|-----|
| Web | Vercel | https://chainguard-beryl.vercel.app |
| API | Railway | https://web-production-b704c.up.railway.app |
| Bot | Railway | @ChainGuardBot |

## Proje Yapısı

```
apps/
  web/        → Next.js frontend (Vercel)
  api/        → FastAPI backend (Railway)
  telegram/   → Telegram bot (Railway)
packages/
  analyzer/   → Skorlama motoru (9 metrik)
  data_collector/ → DexScreener, Helius, EVM pipeline
  shared/     → Ortak modeller
db/
  init.sql           → PostgreSQL şeması
  migrate_sprint3.sql → Referral, API keys
  migrate_sprint4.sql → Pro abonelik, payments
```

## Kurulum

```bash
# Ortam değişkenlerini ayarla
cp .env.example .env

# Altyapı (PostgreSQL + Redis)
docker-compose -f infra/docker-compose.yml up -d

# API
cd apps/api && pip install -r requirements.txt
python main.py

# Frontend
cd apps/web && npm install && npm run dev

# Bot
cd apps/telegram && pip install -r requirements.txt
TELEGRAM_BOT_TOKEN=xxx python bot.py
```

## API

```bash
# Token analizi
GET /api/v1/token/{address}
GET /api/v1/token/{address}/clusters
GET /api/v1/token/{address}/holders

# Trending
GET /api/v1/trending

# WebSocket — gerçek zamanlı skor uyarısı
ws://<host>/ws/v1/alerts?token={address}

# API Key doğrulama
GET /api/v1/keys/validate
Header: X-CG-API-Key: cg_live_...
```

## Risk Seviyeleri

| Skor | Seviye |
|------|--------|
| 0–19 | 🟢 Güvenli |
| 20–39 | 🟡 Düşük Risk |
| 40–59 | 🟠 Orta Risk |
| 60–79 | 🔴 Yüksek Risk |
| 80–100 | 🚨 Kritik |

## Testler

```bash
pytest tests/
```

## Lisans

Tüm hakları saklıdır. © 2026 ChainGuard
