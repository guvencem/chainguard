# 🛡️ ChainGuard

**Solana Token Risk Analiz Platformu**

Solana blockchain üzerindeki tokenları gerçek zamanlı olarak analiz eden, Türkçe risk skoru sunan yapay zeka destekli platform.

## ✨ Özellikler

- 🔍 **Anlık Token Analizi** — Token adresini gir, 3 saniye içinde risk skoru al
- 📊 **3 Temel Metrik** — VLR (wash trading), RLS (likidite riski), Holder analizi
- 🇹🇷 **Türkçe Çıktı** — Risk skorları ve uyarılar Türkçe
- ⚡ **Gerçek Zamanlı Veri** — DexScreener + Helius API ile canlı piyasa verisi
- 🎨 **Modern Arayüz** — Dark theme, glassmorphism, mobil uyumlu

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose
- Helius API Key ([helius.dev](https://helius.dev))

### Kurulum

```bash
# .env dosyasını oluştur
cp .env.example .env
# API anahtarlarını .env dosyasına ekle

# Altyapıyı başlat (PostgreSQL + Redis)
docker-compose -f infra/docker-compose.yml up -d

# Backend
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (ayrı terminal)
cd apps/web
npm install
npm run dev
```

## 📊 API

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/v1/token/{address}` | Token risk analizi |
| GET | `/api/v1/token/{address}/holders` | Holder dağılımı |
| GET | `/api/v1/health` | Sistem sağlık kontrolü |

## 🛡️ Risk Seviyeleri

| Skor | Seviye | Anlamı |
|------|--------|--------|
| 0–19 | 🟢 Güvenli | Düşük risk |
| 20–39 | 🟡 Düşük Risk | İzlenmeli |
| 40–59 | 🟠 Orta Risk | Dikkatli olun |
| 60–79 | 🔴 Yüksek Risk | Tehlikeli |
| 80–100 | 🔴💀 Kritik | Muhtemel dolandırıcılık |

## 📄 Lisans

Bu yazılım **kapalı kaynaktır**. Tüm hakları saklıdır.  
İzinsiz kopyalama, dağıtma ve değiştirme yasaktır.

© 2026 ChainGuard
