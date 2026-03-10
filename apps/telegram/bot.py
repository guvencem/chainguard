"""
Taranoid Telegram Bot — Token Risk Analizi

Komutlar:
  /start    — Karsilama ve kullanim rehberi
  /analyze  — Token risk analizi (/analyze <adres>)
  /watch    — Watchlist yonetimi (/watch add|remove|list <adres>)
  /trending — En cok sorgulanan tokenlar
  /help     — Yardim
  /pro      — Pro plan (Telegram Stars odeme)

Sprint 4 — Telegram Stars Pro odeme, WebSocket altyapisi
"""

import os
import logging
import re
from datetime import datetime, timezone, date, timedelta

import httpx
import asyncpg
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, LabeledPrice
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    CallbackQueryHandler,
    PreCheckoutQueryHandler,
    MessageHandler,
    filters,
)
from telegram.constants import ParseMode

# ── Config ──────────────────────────────────────────────
BOT_TOKEN    = os.getenv("TELEGRAM_BOT_TOKEN", "")
API_URL      = os.getenv("API_URL", "https://web-production-b704c.up.railway.app")
WEB_URL      = os.getenv("WEB_URL", "https://taranoid-beryl.vercel.app")
DATABASE_URL = os.getenv("DATABASE_URL", "")

FREE_LIMIT      = 5
PRO_LIMIT       = 100
PRO_STARS_PRICE = 250   # 250 Telegram Stars ≈ $4.99/ay

ALERT_INTERVAL    = 1800   # 30 dakika
ALERT_THRESHOLD   = 10.0  # skor farki esigi

# ── Logging ─────────────────────────────────────────────
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger("taranoid_bot")

# ── DB Pool ─────────────────────────────────────────────
db_pool: asyncpg.Pool | None = None

# Son bilinen watchlist skorlari (in-memory, restart'ta sifirlanir)
watchlist_scores: dict[int, dict[str, float]] = {}


# ── DB Baglantisi ────────────────────────────────────────

async def init_db():
    global db_pool
    if not DATABASE_URL:
        logger.warning("DATABASE_URL yok — kullanici verisi in-memory tutulacak")
        return
    try:
        db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
        logger.info("Bot DB baglantisi kuruldu")
    except Exception as e:
        logger.error(f"Bot DB baglanti hatasi: {e}")


async def close_db():
    if db_pool:
        await db_pool.close()


# ── Kullanici DB Fonksiyonlari ───────────────────────────

async def get_or_create_user(telegram_id: int, username: str = "") -> dict:
    """Kullaniciyi DB'den al, yoksa olustur."""
    if not db_pool:
        return {"tier": "free", "daily_queries": 0, "last_query_date": None, "watchlist": []}
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM users WHERE telegram_id = $1", telegram_id)
        if not row:
            row = await conn.fetchrow(
                "INSERT INTO users (telegram_id, username) VALUES ($1, $2) RETURNING *",
                telegram_id, username or "",
            )
        return dict(row)


async def check_rate_limit_db(telegram_id: int, username: str = "") -> tuple[bool, int]:
    """Rate limit kontrolu — DB uzerinden. (izin var mi, kalan hak)"""
    today = datetime.now(timezone.utc).date()

    if not db_pool:
        return _check_rate_limit_memory(telegram_id)

    async with db_pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM users WHERE telegram_id = $1", telegram_id)
        if not row:
            await conn.execute(
                "INSERT INTO users (telegram_id, username) VALUES ($1, $2)",
                telegram_id, username or "",
            )
            daily_queries = 0
            tier = "free"
        else:
            # pro_until süresi dolmuşsa tier'ı free'ye düşür
            tier = row["tier"] or "free"
            if tier == "pro":
                pro_until = row.get("pro_until")
                if pro_until and pro_until < datetime.now(timezone.utc):
                    tier = "free"
                    await conn.execute(
                        "UPDATE users SET tier = 'free' WHERE telegram_id = $1", telegram_id
                    )

            if row["last_query_date"] != today:
                await conn.execute(
                    "UPDATE users SET daily_queries = 0, last_query_date = $1 WHERE telegram_id = $2",
                    today, telegram_id,
                )
                daily_queries = 0
            else:
                daily_queries = row["daily_queries"] or 0

        limit = PRO_LIMIT if tier == "pro" else FREE_LIMIT
        if daily_queries >= limit:
            return False, 0

        await conn.execute(
            "UPDATE users SET daily_queries = daily_queries + 1, last_query_date = $1 WHERE telegram_id = $2",
            today, telegram_id,
        )
        return True, limit - daily_queries - 1


async def get_watchlist_db(telegram_id: int) -> list[str]:
    """Kullanicinin watchlist'ini DB'den al."""
    if not db_pool:
        return []
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow("SELECT watchlist FROM users WHERE telegram_id = $1", telegram_id)
        if not row or not row["watchlist"]:
            return []
        return list(row["watchlist"])


async def update_watchlist_db(telegram_id: int, watchlist: list[str]):
    """Watchlist'i DB'ye kaydet."""
    if not db_pool:
        return
    async with db_pool.acquire() as conn:
        await conn.execute(
            "UPDATE users SET watchlist = $1 WHERE telegram_id = $2",
            watchlist, telegram_id,
        )


async def activate_pro_db(telegram_id: int, charge_id: str, stars: int) -> datetime:
    """Pro aboneliği aktifleştir — 30 gün ekle veya uzat."""
    pro_until = datetime.now(timezone.utc) + timedelta(days=30)
    if not db_pool:
        return pro_until
    async with db_pool.acquire() as conn:
        # Mevcut pro_until varsa ve henüz geçmemişse üstüne ekle
        row = await conn.fetchrow("SELECT pro_until FROM users WHERE telegram_id = $1", telegram_id)
        if row and row["pro_until"] and row["pro_until"] > datetime.now(timezone.utc):
            pro_until = row["pro_until"] + timedelta(days=30)

        await conn.execute(
            """UPDATE users SET tier = 'pro', pro_until = $1, stars_charge_id = $2
               WHERE telegram_id = $3""",
            pro_until, charge_id, telegram_id,
        )
        # Ödeme geçmişine kaydet
        try:
            await conn.execute(
                """INSERT INTO payments (telegram_id, charge_id, payload, amount, pro_until)
                   VALUES ($1, $2, 'pro_subscription_30d', $3, $4)
                   ON CONFLICT (charge_id) DO NOTHING""",
                telegram_id, charge_id, stars, pro_until,
            )
        except Exception as e:
            logger.warning(f"Payment kaydı hatası (önemsiz): {e}")
    return pro_until


# ── In-memory fallback ───────────────────────────────────
_mem_users: dict[int, dict] = {}

def _check_rate_limit_memory(user_id: int) -> tuple[bool, int]:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    user = _mem_users.setdefault(user_id, {"count": 0, "date": "", "tier": "free"})
    if user["date"] != today:
        user["date"] = today
        user["count"] = 0
    limit = PRO_LIMIT if user["tier"] == "pro" else FREE_LIMIT
    if user["count"] >= limit:
        return False, 0
    user["count"] += 1
    return True, limit - user["count"]


# ── Yardimci Fonksiyonlar ────────────────────────────────

def risk_emoji(score: float) -> str:
    if score < 20: return "🟢"
    if score < 40: return "🟡"
    if score < 60: return "🟠"
    if score < 80: return "🔴"
    return "🚨"


def _escape(text: str) -> str:
    """MarkdownV2 icin ozel karakterleri escape et."""
    special = r"_*[]()~`>#+-=|{}.!"
    result = ""
    for ch in str(text):
        if ch in special:
            result += "\\" + ch
        else:
            result += ch
    return result


async def fetch_analysis(address: str) -> dict | None:
    """Backend API'den token analizi cek."""
    url = f"{API_URL}/api/v1/token/{address}"
    logger.info(f"API istegi: {url}")
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url)
            logger.info(f"API yanit: status={resp.status_code}")
            if resp.status_code == 200:
                return resp.json()
            logger.error(f"API hata kodu: {resp.status_code}, body={resp.text[:200]}")
            return None
    except httpx.TimeoutException:
        logger.error(f"API timeout (60s): {url}")
        return None
    except Exception as e:
        logger.error(f"API hatasi ({type(e).__name__}): {e}")
        return None


def _build_result_text(data: dict, remaining: int) -> str:
    """Analiz sonucunu formatla."""
    token   = data.get("token", {})
    score   = data.get("score", {})
    metrics = data.get("metrics", {})
    warnings = data.get("warnings_tr", [])

    total    = score.get("total", 0)
    emoji    = risk_emoji(total)
    level_tr = score.get("label_tr", "Bilinmiyor")
    name     = token.get("name", "Unknown")
    symbol   = token.get("symbol", "???")

    vlr     = metrics.get("vlr", {})
    rls     = metrics.get("rls", {})
    holders = metrics.get("holders", {})
    cluster = metrics.get("cluster", {})
    wash    = metrics.get("wash", {})
    sybil   = metrics.get("sybil", {})
    bundler = metrics.get("bundler", {})
    exit_m  = metrics.get("exit", {})
    curve   = metrics.get("curve", {})

    text = (
        f"{emoji} *{_escape(name)}* \\(${_escape(symbol)}\\)\n"
        f"━━━━━━━━━━━━━━━━━━━━━━\n\n"
        f"🛡️ *Risk Skoru: {total:.0f}/100*\n"
        f"📊 Seviye: *{_escape(level_tr)}*\n\n"
        f"*── Temel Metrikler ──*\n"
        f"📊 VLR: `{vlr.get('value', 0):.1f}x` \\(skor: {vlr.get('score', 0):.0f}\\)\n"
        f"💧 RLS: `{rls.get('value', 0):.1f}x` \\(skor: {rls.get('score', 0):.0f}\\)\n"
        f"👥 Holder: `{holders.get('count', 0):,}` \\(skor: {holders.get('score', 0):.0f}\\)\n\n"
        f"*── Gelismis Analiz ──*\n"
        f"🔗 Kumeleme: skor `{cluster.get('score', 0):.0f}`\n"
        f"🔄 Wash: skor `{wash.get('score', 0):.0f}`\n"
        f"🤖 Sybil: skor `{sybil.get('score', 0):.0f}`\n"
        f"📦 Bundler: skor `{bundler.get('score', 0):.0f}`\n"
        f"📉 Cikis: skor `{exit_m.get('score', 0):.0f}`\n"
        f"📐 Curve: skor `{curve.get('score', 0):.0f}`\n"
    )

    if warnings:
        text += f"\n*── Uyarilar ──*\n"
        for w in warnings[:5]:
            text += f"• {_escape(w)}\n"

    text += f"\n_Kalan sorgu: {remaining}/{FREE_LIMIT}_"
    return text


# ── Referral Yardımcıları ────────────────────────────────

async def _get_ref_code(telegram_id: int) -> str | None:
    """DB'den kullanıcının referral kodunu al veya oluştur."""
    if not db_pool:
        return None
    try:
        import secrets, string
        async with db_pool.acquire() as conn:
            row = await conn.fetchrow("SELECT ref_code FROM users WHERE telegram_id = $1", telegram_id)
            if not row:
                return None
            if row["ref_code"]:
                return row["ref_code"]
            # Oluştur
            alpha = string.ascii_uppercase + string.digits
            for _ in range(10):
                code = "CG" + "".join(secrets.choice(alpha) for _ in range(6))
                exists = await conn.fetchrow("SELECT 1 FROM users WHERE ref_code = $1", code)
                if not exists:
                    await conn.execute("UPDATE users SET ref_code = $1 WHERE telegram_id = $2", code, telegram_id)
                    return code
    except Exception as e:
        logger.error(f"Ref code hatasi: {e}")
    return None


async def _apply_referral(ref_code: str, new_telegram_id: int) -> bool:
    """Referral kodu uygula, her iki tarafa bonus ver."""
    if not db_pool:
        return False
    try:
        from datetime import date, timedelta
        async with db_pool.acquire() as conn:
            referrer = await conn.fetchrow("SELECT id, telegram_id FROM users WHERE ref_code = $1", ref_code)
            if not referrer:
                return False
            if referrer["telegram_id"] == new_telegram_id:
                return False
            new_user = await conn.fetchrow("SELECT id, referred_by FROM users WHERE telegram_id = $1", new_telegram_id)
            if not new_user or new_user["referred_by"]:
                return False

            today = date.today()
            await conn.execute("""
                INSERT INTO referrals (referrer_id, referred_id, ref_code, converted, reward_given)
                VALUES ($1, $2, $3, TRUE, TRUE)
            """, referrer["id"], new_user["id"], ref_code)
            await conn.execute("""
                UPDATE users SET bonus_until = GREATEST(COALESCE(bonus_until, $1), $1),
                total_referrals = total_referrals + 1 WHERE id = $2
            """, today + timedelta(days=7), referrer["id"])
            await conn.execute("""
                UPDATE users SET bonus_until = $1, referred_by = $2 WHERE id = $3
            """, today + timedelta(days=3), ref_code, new_user["id"])

        logger.info(f"Referral uygulandi: {ref_code} -> {new_telegram_id}")
        return True
    except Exception as e:
        logger.error(f"Referral uygulama hatasi: {e}")
        return False


# ── /start ──────────────────────────────────────────────

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    await get_or_create_user(user.id, user.username or "")

    # Referral kodu kontrolü: /start REF_CODE
    if context.args:
        ref_code = context.args[0].strip().upper()
        if ref_code.startswith("CG") and len(ref_code) == 8:
            applied = await _apply_referral(ref_code, user.id)
            if applied:
                await update.message.reply_text(
                    "🎁 *Referral kodu uygulandı\\!*\n\n"
                    "✅ 3 gün artırılmış sorgu limiti kazandın\\.\n"
                    "Seni davet eden de 7 gün bonus kazandı\\.",
                    parse_mode=ParseMode.MARKDOWN_V2,
                )

    welcome = (
        f"👋 Merhaba, *{_escape(user.first_name)}*\\!\n\n"
        "🛡️ *Taranoid Bot* — Solana Token Risk Analizi\n\n"
        "Token adresini gonder, saniyeler icinde *9 metrikle* risk skorunu ogren\\.\n\n"
        "📋 *Komutlar:*\n"
        "• `/analyze <adres>` — Token analizi\n"
        "• `/watch add <adres>` — Watchlist'e ekle\n"
        "• `/watch list` — Watchlist goruntule\n"
        "• `/watch remove <adres>` — Watchlist'ten cikar\n"
        "• `/trending` — En cok sorgulanan tokenlar\n"
        "• `/stats` — Kullanim istatistiklerin\n"
        "• `/referral` — Arkadaslarini davet et, bonus kazan\n"
        "• `/apikey` — API anahtarını al\n"
        "• `/help` — Yardim\n\n"
        f"🔗 [Web Arayuzu]({WEB_URL})\n"
        f"🔑 [API Anahtarlari]({WEB_URL}/keys)\n\n"
        f"📊 Gunluk sorgu hakkin: *{FREE_LIMIT}* \\(Free\\)\n"
        "_Pro'ya gecmek icin /pro yazin\\._"
    )

    keyboard = [
        [InlineKeyboardButton("🌐 Web Arayuzu", url=WEB_URL)],
        [InlineKeyboardButton("📊 Ornek: BONK Analizi", callback_data="analyze_DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263")],
        [InlineKeyboardButton("🎁 Arkadaslarini Davet Et", callback_data="referral")],
    ]

    await update.message.reply_text(
        welcome,
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup(keyboard),
        disable_web_page_preview=True,
    )


# ── /help ────────────────────────────────────────────────

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    help_text = (
        "🛡️ *Taranoid Bot Komutlari*\n\n"
        "*Analiz:*\n"
        "• `/analyze <token_adresi>` — 9 metrikle risk analizi\n\n"
        "*Watchlist:*\n"
        "• `/watch add <adres>` — Takibe al \\(maks 10\\)\n"
        "• `/watch list` — Takip listeni gor\n"
        "• `/watch remove <adres>` — Takipten cikar\n\n"
        "*Diger:*\n"
        "• `/trending` — En cok sorgulanan tokenlar\n"
        "• `/stats` — Kullanim istatistiklerin\n"
        "• `/pro` — Pro plan bilgisi\n"
        "• `/apikey` — API anahtarını al\n\n"
        "*Abonelik:*\n"
        f"• Free: gunluk {FREE_LIMIT} sorgu\n"
        f"• Pro: gunluk {PRO_LIMIT} sorgu \\+ watchlist uyarilari"
    )
    await update.message.reply_text(help_text, parse_mode=ParseMode.MARKDOWN_V2)


# ── /analyze ─────────────────────────────────────────────

async def analyze_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user

    if not context.args:
        await update.message.reply_text(
            "❌ Token adresi gerekli\\.\n\n"
            "Kullanim: `/analyze <solana_token_adresi>`\n\n"
            "Ornek:\n`/analyze DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    address = context.args[0].strip()
    if not re.match(r"^[1-9A-HJ-NP-Za-km-z]{32,44}$", address):
        await update.message.reply_text("❌ Gecersiz Solana token adresi\\.", parse_mode=ParseMode.MARKDOWN_V2)
        return

    allowed, remaining = await check_rate_limit_db(user.id, user.username or "")
    if not allowed:
        await update.message.reply_text(
            f"⏳ Gunluk sorgu limitine ulastin \\({FREE_LIMIT}/gun\\)\\.\n\nPro'ya gec: `/pro`",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    loading_msg = await update.message.reply_text(
        "⏳ *Token analiz ediliyor\\.\\.\\.*\n9 metrik hesaplaniyor, lutfen bekleyin ⚡",
        parse_mode=ParseMode.MARKDOWN_V2,
    )

    data = await fetch_analysis(address)
    if not data:
        await loading_msg.edit_text(
            "❌ Token analiz edilemedi\\.\nAdresin dogru oldugunden emin olun\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    result_text = _build_result_text(data, remaining)
    total_score = data.get("score", {}).get("total", 0)
    keyboard = [
        [InlineKeyboardButton("🌐 Detayli Analiz", url=f"{WEB_URL}/token/{address}")],
        [
            InlineKeyboardButton("👁 Watchlist'e Ekle", callback_data=f"watch_add_{address}"),
            InlineKeyboardButton("🔄 Yenile", callback_data=f"analyze_{address}"),
        ],
    ]
    # Riski olan tokenlarda guvenli borsa linkleri ekle
    if total_score >= 30:
        keyboard.append([
            InlineKeyboardButton("🟡 Binance", url=f"{API_URL}/api/v1/affiliate/click?exchange=binance&source=telegram&token_address={address}"),
            InlineKeyboardButton("🔵 OKX", url=f"{API_URL}/api/v1/affiliate/click?exchange=okx&source=telegram&token_address={address}"),
            InlineKeyboardButton("🟠 Bybit", url=f"{API_URL}/api/v1/affiliate/click?exchange=bybit&source=telegram&token_address={address}"),
        ])

    await loading_msg.edit_text(
        result_text,
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup(keyboard),
        disable_web_page_preview=True,
    )


# ── /watch ───────────────────────────────────────────────

async def watch_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user

    if not context.args:
        await update.message.reply_text(
            "📋 *Watchlist Komutlari:*\n\n"
            "• `/watch add <adres>` — Token ekle\n"
            "• `/watch list` — Listeyi gor\n"
            "• `/watch remove <adres>` — Token cikar",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    action = context.args[0].lower()

    if action == "list":
        watchlist = await get_watchlist_db(user.id)
        if not watchlist:
            await update.message.reply_text(
                "📋 Watchlist'in bos\\. `/watch add <adres>` ile ekle\\.",
                parse_mode=ParseMode.MARKDOWN_V2,
            )
            return

        text = "📋 *Watchlist:*\n\n"
        for i, addr in enumerate(watchlist, 1):
            short = f"{addr[:6]}\\.\\.\\{addr[-4:]}"
            text += f"{i}\\. `{short}`\n"

        keyboard = [[InlineKeyboardButton(f"📊 Analiz #{i}", callback_data=f"analyze_{addr}")] for i, addr in enumerate(watchlist, 1)]
        await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN_V2, reply_markup=InlineKeyboardMarkup(keyboard))
        return

    if action == "add" and len(context.args) >= 2:
        address = context.args[1].strip()
        if len(address) < 32:
            await update.message.reply_text("❌ Gecersiz adres\\.", parse_mode=ParseMode.MARKDOWN_V2)
            return

        watchlist = await get_watchlist_db(user.id)
        if address in watchlist:
            await update.message.reply_text("ℹ️ Bu token zaten watchlist'inde\\.", parse_mode=ParseMode.MARKDOWN_V2)
            return
        if len(watchlist) >= 10:
            await update.message.reply_text("❌ Watchlist limiti: 10 token\\.", parse_mode=ParseMode.MARKDOWN_V2)
            return

        watchlist.append(address)
        await update_watchlist_db(user.id, watchlist)
        short = f"{address[:6]}\\.\\.\\{address[-4:]}"
        await update.message.reply_text(
            f"✅ `{short}` watchlist'e eklendi\\!\n📋 Toplam: {len(watchlist)} token",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    if action == "remove" and len(context.args) >= 2:
        address = context.args[1].strip()
        watchlist = await get_watchlist_db(user.id)
        if address in watchlist:
            watchlist.remove(address)
            await update_watchlist_db(user.id, watchlist)
            await update.message.reply_text("✅ Token watchlist'ten cikarildi\\.", parse_mode=ParseMode.MARKDOWN_V2)
        else:
            await update.message.reply_text("❌ Bu token watchlist'inde yok\\.", parse_mode=ParseMode.MARKDOWN_V2)
        return

    await update.message.reply_text("❓ Gecersiz komut\\. `/watch add|remove|list` kullan\\.", parse_mode=ParseMode.MARKDOWN_V2)


# ── /trending ─────────────────────────────────────────────

async def trending_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    loading = await update.message.reply_text(
        "⏳ *Trend tokenlar yukleniyor\\.\\.\\.*",
        parse_mode=ParseMode.MARKDOWN_V2,
    )

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{API_URL}/api/v1/trending")
            if resp.status_code != 200:
                await loading.edit_text("❌ Trend verisi alinamadi\\.", parse_mode=ParseMode.MARKDOWN_V2)
                return
            data = resp.json()
    except Exception as e:
        logger.error(f"Trending hatasi: {e}")
        await loading.edit_text("❌ Baglanti hatasi\\.", parse_mode=ParseMode.MARKDOWN_V2)
        return

    tokens = data.get("tokens", [])
    if not tokens:
        await loading.edit_text(
            "📊 *Trend Tokenlar*\n\nHenuz veri yok\\. Token analiz ettikce burada gorunecek\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    text = "📊 *En Cok Sorgulanan Tokenlar*\n\n"
    for i, t in enumerate(tokens[:10], 1):
        emoji = risk_emoji(t.get("total_score", 0))
        name = _escape(t.get("name") or t.get("token_address", "")[:8])
        score = t.get("total_score", 0)
        queries = t.get("query_count", 0)
        text += f"{i}\\. {emoji} *{name}* — `{score:.0f}` puan \\({queries}x\\)\n"

    await loading.edit_text(text, parse_mode=ParseMode.MARKDOWN_V2)


# ── /referral ───────────────────────────────────────────

async def referral_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    ref_code = await _get_ref_code(user.id)

    if not ref_code:
        await update.message.reply_text(
            "❌ Referral kodun olusturulamadi\\. Lutfen once /start yaz\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    bot_username = context.bot.username or "taranoidbot"
    bot_link = f"https://t\\.me/{bot_username}?start={ref_code}"
    web_link = f"{WEB_URL}/?ref={ref_code}"

    # Davet istatistikleri
    invite_count = 0
    bonus_text = "_Bonus yok_"
    if db_pool:
        try:
            async with db_pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT total_referrals, bonus_until FROM users WHERE telegram_id = $1", user.id
                )
                if row:
                    invite_count = row["total_referrals"] or 0
                    if row["bonus_until"]:
                        from datetime import date
                        if row["bonus_until"] >= date.today():
                            bonus_text = f"✅ Bonus aktif \\({row['bonus_until'].strftime('%d\\.%m\\.%Y')}'e kadar\\)"
                        else:
                            bonus_text = "Bonus süresi doldu"
        except Exception:
            pass

    text = (
        "🎁 *Referral Programı*\n\n"
        f"Senin referral kodun: `{ref_code}`\n\n"
        "📤 *Davet linkin:*\n"
        f"`{bot_link}`\n\n"
        "*Kazanımlar:*\n"
        "• Davet ettiğin kişi: 3 gün bonus sorgu hakkı\n"
        "• Sen: her davet için 7 gün bonus sorgu hakkı\n\n"
        f"👥 Toplam davet: *{invite_count}* kişi\n"
        f"⭐ Bonus durumu: {bonus_text}\n\n"
        "_Linki Telegram gruplarında, Twitter'da paylaş\\!_"
    )

    keyboard = [[
        InlineKeyboardButton("📤 Linki Kopyala", switch_inline_query=f"Taranoid ile {invite_count} kişiyi güvende tut! t.me/{bot_username}?start={ref_code}"),
    ]]

    await update.message.reply_text(
        text,
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup(keyboard),
        disable_web_page_preview=True,
    )


# ── /stats ───────────────────────────────────────────────

async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    if db_pool:
        async with db_pool.acquire() as conn:
            row = await conn.fetchrow("SELECT * FROM users WHERE telegram_id = $1", user.id)
    else:
        row = None

    if row:
        tier = row["tier"] or "free"
        daily = row["daily_queries"] or 0
        wl_count = len(row["watchlist"] or [])
        created = row["created_at"].strftime("%d.%m.%Y") if row.get("created_at") else "?"
        limit = PRO_LIMIT if tier == "pro" else FREE_LIMIT
        text = (
            f"📊 *Kullanim Istatistiklerin*\n\n"
            f"👤 Kullanici: *{_escape(user.first_name)}*\n"
            f"⭐ Plan: *{_escape(tier.upper())}*\n"
            f"📅 Uye: {_escape(created)}\n\n"
            f"🔢 Bugunki sorgu: `{daily}/{limit}`\n"
            f"📋 Watchlist: `{wl_count}/10` token\n\n"
            f"_Daha fazla analiz icin /pro yazin\\._"
        )
    else:
        text = (
            f"📊 *Kullanim Istatistiklerin*\n\n"
            f"Henuz kayit bulunamadi\\. /start ile baslat\\."
        )
    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN_V2)


# ── /pro ─────────────────────────────────────────────────

async def pro_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user

    # Mevcut abonelik durumunu kontrol et
    pro_until = None
    if db_pool:
        try:
            async with db_pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT tier, pro_until FROM users WHERE telegram_id = $1", user.id
                )
                if row and row["tier"] == "pro" and row["pro_until"]:
                    pro_until = row["pro_until"]
                    if pro_until < datetime.now(timezone.utc):
                        pro_until = None
        except Exception:
            pass

    if pro_until:
        until_str = _escape(pro_until.strftime("%d.%m.%Y"))
        await update.message.reply_text(
            "✅ *Pro Uyeligin Aktif\\!*\n\n"
            f"📅 Bitis tarihi: *{until_str}*\n"
            f"📊 Gunluk sorgu: *{PRO_LIMIT}*\n"
            "🔔 Watchlist uyarilari aktif\n\n"
            f"_Uzatmak icin tekrar satin al — {PRO_STARS_PRICE} Stars/ay_",
            parse_mode=ParseMode.MARKDOWN_V2,
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton(f"⭐ {PRO_STARS_PRICE} Stars ile Uzat", callback_data="buy_pro"),
            ]]),
        )
        return

    await update.message.reply_text(
        "⭐ *Taranoid Pro*\n\n"
        f"📊 Gunluk *{PRO_LIMIT}* sorgu \\(Free: {FREE_LIMIT}\\)\n"
        "🔔 Watchlist uyarilari \\(otomatik bildirim\\)\n"
        "📈 Oncelikli analiz\n"
        "🎯 Affiliate linki kazanclari\n\n"
        f"💰 Fiyat: *{PRO_STARS_PRICE} Telegram Stars* / 30 gun\n\n"
        "_Telegram Stars ile aninda, guvenli odeme\\._",
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton(f"⭐ {PRO_STARS_PRICE} Stars ile Satin Al", callback_data="buy_pro"),
        ]]),
    )


# ── Telegram Stars Odeme ─────────────────────────────────

async def pre_checkout_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Telegram odeme onay handler — her zaman onayla."""
    query = update.pre_checkout_query
    if query.invoice_payload == "pro_subscription_30d":
        await query.answer(ok=True)
    else:
        await query.answer(ok=False, error_message="Gecersiz odeme. Lutfen tekrar deneyin.")


async def successful_payment_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Basarili odeme sonrasi Pro aktivasyonu."""
    user = update.effective_user
    payment = update.message.successful_payment

    if payment.invoice_payload != "pro_subscription_30d":
        return

    charge_id = payment.telegram_payment_charge_id
    stars = payment.total_amount  # Stars miktarı

    pro_until = await activate_pro_db(user.id, charge_id, stars)
    until_str = _escape(pro_until.strftime("%d.%m.%Y"))

    await update.message.reply_text(
        "🎉 *Pro Uyeligin Aktif\\!*\n\n"
        f"✅ {stars} Stars odendi\n"
        f"📅 Gecerlilik: *{until_str}*'e kadar\n"
        f"📊 Gunluk sorgu: *{PRO_LIMIT}*\n"
        "🔔 Watchlist uyarilari aktif\n\n"
        "_Taranoid Pro ile korunmaya devam et\\!_ 🛡️",
        parse_mode=ParseMode.MARKDOWN_V2,
    )
    logger.info(f"Pro aktivasyonu: user={user.id}, charge={charge_id}, until={pro_until}")


# ── /apikey ──────────────────────────────────────────────

async def apikey_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Kullanicinin API anahtarini goster veya olustur."""
    user = update.effective_user

    loading = await update.message.reply_text(
        "🔑 *API anahtarın alınıyor\\.\\.\\.*",
        parse_mode=ParseMode.MARKDOWN_V2,
    )

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            # Mevcut anahtarları kontrol et
            resp = await client.get(f"{API_URL}/api/v1/keys?telegram_id={user.id}")
            if resp.status_code == 200:
                data = resp.json()
                keys = data.get("keys", [])
            else:
                keys = []

            if keys:
                # Mevcut anahtar var — göster (maskeli)
                key = keys[0]
                masked = key.get("key_id", "???")
                tier = key.get("tier", "free").upper()
                daily_limit = key.get("daily_limit", 100)
                daily_used = key.get("daily_used", 0)

                text = (
                    "🔑 *API Anahtarın*\n\n"
                    f"```\n{_escape(masked)}\n```\n\n"
                    f"⭐ Tier: *{_escape(tier)}*\n"
                    f"📊 Kullanım: `{daily_used}/{daily_limit}` istek/gün\n\n"
                    "_Tam anahtarı görüntülemek için web panelini kullan\\._\n"
                    f"🌐 [API Dokümantasyonu]({WEB_URL}/keys)"
                )
            else:
                # Yeni anahtar oluştur
                create_resp = await client.post(
                    f"{API_URL}/api/v1/keys",
                    json={"telegram_id": user.id, "name": f"Bot Key — {user.first_name}"},
                )
                if create_resp.status_code == 200:
                    key_data = create_resp.json()
                    new_key = key_data.get("key", "")
                    text = (
                        "✅ *Yeni API Anahtarın Oluşturuldu\\!*\n\n"
                        "```\n" + _escape(new_key) + "\n```\n\n"
                        "⚠️ *Bu anahtarı güvenli bir yerde sakla\\!*\n"
                        "_Bir daha gösterilmeyecek\\._\n\n"
                        f"📊 Limit: `100 istek/gün` \\(Free\\)\n"
                        "🔗 Header: `X\\-CG\\-API\\-Key: cg\\_live\\_\\.\\.\\.`\n\n"
                        f"🌐 [API Dokümantasyonu]({WEB_URL}/keys)"
                    )
                else:
                    err = create_resp.json().get("detail", "Bilinmeyen hata")
                    text = f"❌ Anahtar oluşturulamadı: {_escape(err)}"

    except Exception as e:
        logger.error(f"apikey hatası: {e}")
        text = "❌ Bağlantı hatası. Lütfen tekrar deneyin."

    await loading.edit_text(
        text,
        parse_mode=ParseMode.MARKDOWN_V2,
        disable_web_page_preview=True,
    )


# ── Watchlist Alert Job ──────────────────────────────────

async def watchlist_alert_job(context: ContextTypes.DEFAULT_TYPE):
    """Her 30 dakikada bir watchlist tokenlarini kontrol et, skor degisirse bildir."""
    if not db_pool:
        return

    try:
        async with db_pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT telegram_id, watchlist FROM users WHERE array_length(watchlist, 1) > 0"
            )
    except Exception as e:
        logger.error(f"Watchlist alert DB hatasi: {e}")
        return

    for row in rows:
        telegram_id = row["telegram_id"]
        watchlist = list(row["watchlist"] or [])

        for address in watchlist:
            try:
                data = await fetch_analysis(address)
                if not data:
                    continue

                new_score = data.get("score", {}).get("total", 0)
                old_score = watchlist_scores.get(telegram_id, {}).get(address)

                # Skoru guncelle
                if telegram_id not in watchlist_scores:
                    watchlist_scores[telegram_id] = {}
                watchlist_scores[telegram_id][address] = new_score

                # Ilk kontrol — baz deger olustur, bildirim gonderme
                if old_score is None:
                    continue

                if abs(new_score - old_score) >= ALERT_THRESHOLD:
                    token_name = data.get("token", {}).get("name", address[:8])
                    emoji = risk_emoji(new_score)
                    direction = "⬆️ Artti" if new_score > old_score else "⬇️ Azaldi"

                    await context.bot.send_message(
                        chat_id=telegram_id,
                        text=(
                            f"🔔 *Watchlist Uyarisi*\n\n"
                            f"{emoji} *{_escape(token_name)}*\n"
                            f"Risk Skoru: `{old_score:.0f}` → `{new_score:.0f}` {direction}\n\n"
                            f"`{address}`\n\n"
                            f"[Detayli Analiz]({WEB_URL}/token/{address})"
                        ),
                        parse_mode=ParseMode.MARKDOWN_V2,
                        disable_web_page_preview=True,
                    )
                    logger.info(f"Watchlist uyarisi gonderildi: {telegram_id} → {address} ({old_score:.0f}→{new_score:.0f})")

            except Exception as e:
                logger.error(f"Watchlist kontrol hatasi ({address}): {e}")


# ── Callback Queries ─────────────────────────────────────

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data
    user = query.from_user

    if data.startswith("analyze_"):
        address = data.replace("analyze_", "")

        allowed, remaining = await check_rate_limit_db(user.id, user.username or "")
        if not allowed:
            await query.edit_message_text(
                f"⏳ Gunluk limit doldu \\({FREE_LIMIT}/gun\\)\\.",
                parse_mode=ParseMode.MARKDOWN_V2,
            )
            return

        await query.edit_message_text("⏳ *Analiz ediliyor\\.\\.\\.*", parse_mode=ParseMode.MARKDOWN_V2)

        result = await fetch_analysis(address)
        if not result:
            await query.edit_message_text("❌ Analiz basarisiz\\.", parse_mode=ParseMode.MARKDOWN_V2)
            return

        token = result.get("token", {})
        score = result.get("score", {})
        total = score.get("total", 0)
        emoji = risk_emoji(total)
        name   = token.get("name", "Unknown")
        symbol = token.get("symbol", "???")

        keyboard = [[InlineKeyboardButton("🌐 Detayli Analiz", url=f"{WEB_URL}/token/{address}")]]
        await query.edit_message_text(
            f"{emoji} *{_escape(name)}* \\(${_escape(symbol)}\\)\n"
            f"Risk Skoru: *{total:.0f}/100* — {_escape(score.get('label_tr', ''))}",
            parse_mode=ParseMode.MARKDOWN_V2,
            reply_markup=InlineKeyboardMarkup(keyboard),
        )

    elif data == "referral":
        ref_code = await _get_ref_code(user.id)
        if ref_code:
            bot_username = context.bot.username or "taranoidbot"
            link = f"https://t.me/{bot_username}?start={ref_code}"
            await query.answer(f"Referral kodun: {ref_code}", show_alert=True)
        else:
            await query.answer("Referral kodu oluşturulamadı.", show_alert=True)

    elif data == "buy_pro":
        # Stars invoice gönder
        await context.bot.send_invoice(
            chat_id=query.message.chat_id,
            title="Taranoid Pro — 30 Gün",
            description=(
                f"✅ Günlük {PRO_LIMIT} sorgu hakkı\n"
                "✅ Watchlist uyarıları\n"
                "✅ Öncelikli analiz\n"
                "✅ Affiliate kazançları"
            ),
            payload="pro_subscription_30d",
            currency="XTR",  # Telegram Stars
            prices=[LabeledPrice("Taranoid Pro (30 gün)", PRO_STARS_PRICE)],
        )
        await query.answer()

    elif data.startswith("watch_add_"):
        address = data.replace("watch_add_", "")
        watchlist = await get_watchlist_db(user.id)

        if address not in watchlist:
            if len(watchlist) >= 10:
                await query.answer("❌ Watchlist limiti: 10 token", show_alert=True)
                return
            watchlist.append(address)
            await update_watchlist_db(user.id, watchlist)
            await query.answer("✅ Watchlist'e eklendi!", show_alert=True)
        else:
            await query.answer("ℹ️ Zaten watchlist'inde.", show_alert=True)


# ── Main ─────────────────────────────────────────────────

def main():
    if not BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN ortam degiskeni ayarlanmamis!")
        return

    app = Application.builder().token(BOT_TOKEN).build()

    # Komut handler'lari
    app.add_handler(CommandHandler("start",    start_command))
    app.add_handler(CommandHandler("help",     help_command))
    app.add_handler(CommandHandler("analyze",  analyze_command))
    app.add_handler(CommandHandler("watch",    watch_command))
    app.add_handler(CommandHandler("trending", trending_command))
    app.add_handler(CommandHandler("stats",    stats_command))
    app.add_handler(CommandHandler("referral", referral_command))
    app.add_handler(CommandHandler("pro",      pro_command))
    app.add_handler(CommandHandler("apikey",   apikey_command))
    app.add_handler(CallbackQueryHandler(button_callback))

    # Telegram Stars odeme handler'lari
    app.add_handler(PreCheckoutQueryHandler(pre_checkout_handler))
    app.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, successful_payment_handler))

    # Watchlist alert job — 30 dakikada bir
    app.job_queue.run_repeating(
        watchlist_alert_job,
        interval=ALERT_INTERVAL,
        first=60,  # baslangictan 60s sonra ilk kontrol
    )

    async def post_init(application: Application):
        await init_db()

    async def post_shutdown(application: Application):
        await close_db()

    app.post_init     = post_init
    app.post_shutdown = post_shutdown

    logger.info("🤖 Taranoid Bot baslatiliyor...")
    app.run_polling(allowed_updates=Update.ALL_TYPES, drop_pending_updates=True)


if __name__ == "__main__":
    main()
