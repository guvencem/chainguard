"""
ChainGuard Telegram Bot — Token Risk Analizi

Komutlar:
  /start    — Karşılama ve kullanım rehberi
  /analyze  — Token risk analizi (/analyze <adres>)
  /watch    — Watchlist yönetimi (/watch add|remove|list <adres>)
  /help     — Yardım

Sprint 2 — Rate limiting (free: 5/gün, pro: 100/gün)
"""

import os
import logging
from datetime import datetime, timezone
from collections import defaultdict

import httpx
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    CallbackQueryHandler,
)
from telegram.constants import ParseMode

# ── Config ──────────────────────────────────────────────
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
API_URL = os.getenv("API_URL", "https://web-production-b704c.up.railway.app")
WEB_URL = os.getenv("WEB_URL", "https://chainguard-beryl.vercel.app")

FREE_LIMIT = 5
PRO_LIMIT = 100

# ── Logging ─────────────────────────────────────────────
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger("chainguard_bot")

# ── In-memory state (production'da Redis/DB kullanılacak) ──
user_queries: dict[int, dict] = defaultdict(lambda: {"count": 0, "date": "", "tier": "free", "watchlist": []})


# ── Yardımcı Fonksiyonlar ───────────────────────────────

def check_rate_limit(user_id: int) -> tuple[bool, int]:
    """Rate limit kontrol — (izin var mı, kalan hak)"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    user = user_queries[user_id]

    if user["date"] != today:
        user["date"] = today
        user["count"] = 0

    limit = PRO_LIMIT if user["tier"] == "pro" else FREE_LIMIT
    remaining = limit - user["count"]

    if remaining <= 0:
        return False, 0

    user["count"] += 1
    return True, remaining - 1


def risk_emoji(score: float) -> str:
    if score < 20: return "🟢"
    if score < 40: return "🟡"
    if score < 60: return "🟠"
    if score < 80: return "🔴"
    return "🚨"


def format_number(n: float) -> str:
    if n >= 1_000_000: return f"${n/1_000_000:.1f}M"
    if n >= 1_000: return f"${n/1_000:.1f}K"
    return f"${n:.0f}"


async def fetch_analysis(address: str) -> dict | None:
    """Backend API'den token analizi çek."""
    url = f"{API_URL}/api/v1/token/{address}"
    logger.info(f"API isteği: {url}")
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.get(url)
            logger.info(f"API yanıt: status={resp.status_code}, url={url}")
            if resp.status_code == 200:
                return resp.json()
            logger.error(f"API hata kodu: {resp.status_code}, body={resp.text[:200]}")
            return None
    except httpx.TimeoutException:
        logger.error(f"API timeout (60s): {url}")
        return None
    except Exception as e:
        logger.error(f"API hatası ({type(e).__name__}): {e}")
        return None


# ── /start ──────────────────────────────────────────────

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Karşılama mesajı."""
    user = update.effective_user
    welcome = (
        f"👋 Merhaba, *{user.first_name}*\\!\n\n"
        "🛡️ *ChainGuard Bot* — Solana Token Risk Analizi\n\n"
        "Token adresini gönder, saniyeler içinde *9 metrikle* risk skorunu öğren\\.\n\n"
        "📋 *Komutlar:*\n"
        "• `/analyze <adres>` — Token analizi\n"
        "• `/watch add <adres>` — Watchlist'e ekle\n"
        "• `/watch list` — Watchlist görüntüle\n"
        "• `/watch remove <adres>` — Watchlist'ten çıkar\n"
        "• `/help` — Yardım\n\n"
        f"🔗 [Web Arayüzü]({WEB_URL})\n\n"
        f"📊 Günlük sorgu hakkın: *{FREE_LIMIT}* \\(Free\\)\n"
        "_Pro'ya geçmek için /pro yazın\\._"
    )

    keyboard = [
        [InlineKeyboardButton("🌐 Web Arayüzü", url=WEB_URL)],
        [InlineKeyboardButton("📊 Örnek: BONK Analizi", callback_data="analyze_DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263")],
    ]

    await update.message.reply_text(
        welcome,
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup(keyboard),
        disable_web_page_preview=True,
    )


# ── /help ───────────────────────────────────────────────

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    help_text = (
        "🛡️ *ChainGuard Bot Komutları*\n\n"
        "*Analiz:*\n"
        "• `/analyze <token_adresi>` — 9 metrikle risk analizi\n"
        "• Token adresini direkt yapıştır → otomatik analiz\n\n"
        "*Watchlist:*\n"
        "• `/watch add <adres>` — Takibe al\n"
        "• `/watch list` — Takip listeni gör\n"
        "• `/watch remove <adres>` — Takipten çıkar\n\n"
        "*Abonelik:*\n"
        f"• Free: günlük {FREE_LIMIT} sorgu\n"
        f"• Pro: günlük {PRO_LIMIT} sorgu\n"
        "• `/pro` — Pro planı hakkında bilgi"
    )
    await update.message.reply_text(help_text, parse_mode=ParseMode.MARKDOWN_V2)


# ── /analyze ────────────────────────────────────────────

async def analyze_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Token risk analizi."""
    user_id = update.effective_user.id

    # Adres kontrolü
    if not context.args or len(context.args) < 1:
        await update.message.reply_text(
            "❌ Token adresi gerekli\\.\n\n"
            "Kullanım: `/analyze <solana_token_adresi>`\n\n"
            "Örnek:\n`/analyze DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    address = context.args[0].strip()

    # Basit adres doğrulama
    if len(address) < 32 or len(address) > 44:
        await update.message.reply_text("❌ Geçersiz Solana token adresi\\.", parse_mode=ParseMode.MARKDOWN_V2)
        return

    # Rate limit
    allowed, remaining = check_rate_limit(user_id)
    if not allowed:
        await update.message.reply_text(
            f"⏳ Günlük sorgu limitine ulaştın \\({FREE_LIMIT}/gün\\)\\.\n\n"
            "Pro'ya geçerek limiti artır: `/pro`",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    # Loading mesajı
    loading_msg = await update.message.reply_text(
        "⏳ *Token analiz ediliyor\\.\\.\\.*\n"
        "9 metrik hesaplanıyor, lütfen bekleyin ⚡",
        parse_mode=ParseMode.MARKDOWN_V2,
    )

    # API'den veri çek
    data = await fetch_analysis(address)

    if not data:
        await loading_msg.edit_text(
            "❌ Token analiz edilemedi\\.\n"
            "Adresin doğru olduğundan emin olun\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    # Sonucu formatla
    token = data.get("token", {})
    score = data.get("score", {})
    metrics = data.get("metrics", {})
    warnings = data.get("warnings_tr", [])

    total = score.get("total", 0)
    emoji = risk_emoji(total)
    level_tr = score.get("label_tr", "Bilinmiyor")

    vlr = metrics.get("vlr", {})
    rls = metrics.get("rls", {})
    holders = metrics.get("holders", {})
    cluster = metrics.get("cluster", {})
    wash = metrics.get("wash", {})
    sybil = metrics.get("sybil", {})
    bundler = metrics.get("bundler", {})
    exit_m = metrics.get("exit", {})
    curve = metrics.get("curve", {})

    name = token.get("name", "Unknown")
    symbol = token.get("symbol", "???")

    # Skor özeti
    result_text = (
        f"{emoji} *{_escape(name)}* \\(${_escape(symbol)}\\)\n"
        f"━━━━━━━━━━━━━━━━━━━━━━\n\n"
        f"🛡️ *Risk Skoru: {total:.0f}/100*\n"
        f"📊 Seviye: *{_escape(level_tr)}*\n\n"
        f"*── Temel Metrikler ──*\n"
        f"📊 VLR: `{vlr.get('value', 0):.1f}x` \\(skor: {vlr.get('score', 0):.0f}\\)\n"
        f"💧 RLS: `{rls.get('value', 0):.1f}x` \\(skor: {rls.get('score', 0):.0f}\\)\n"
        f"👥 Holder: `{holders.get('count', 0):,}` \\(skor: {holders.get('score', 0):.0f}\\)\n\n"
        f"*── Gelişmiş Analiz ──*\n"
        f"🔗 Kümeleme: skor `{cluster.get('score', 0):.0f}`\n"
        f"🔄 Wash: skor `{wash.get('score', 0):.0f}`\n"
        f"🤖 Sybil: skor `{sybil.get('score', 0):.0f}`\n"
        f"📦 Bundler: skor `{bundler.get('score', 0):.0f}`\n"
        f"📉 Çıkış: skor `{exit_m.get('score', 0):.0f}`\n"
        f"📐 Curve: skor `{curve.get('score', 0):.0f}`\n"
    )

    # Uyarılar
    if warnings:
        result_text += f"\n*── Uyarılar ──*\n"
        for w in warnings[:5]:
            result_text += f"• {_escape(w)}\n"

    result_text += f"\n_Kalan sorgu: {remaining}/{FREE_LIMIT}_"

    # Butonlar
    keyboard = [
        [InlineKeyboardButton("🌐 Detaylı Analiz", url=f"{WEB_URL}/token/{address}")],
        [
            InlineKeyboardButton("👁 Watchlist'e Ekle", callback_data=f"watch_add_{address}"),
            InlineKeyboardButton("🔄 Yenile", callback_data=f"analyze_{address}"),
        ],
    ]

    await loading_msg.edit_text(
        result_text,
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup(keyboard),
        disable_web_page_preview=True,
    )


# ── /watch ──────────────────────────────────────────────

async def watch_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Watchlist yönetimi."""
    user_id = update.effective_user.id
    user = user_queries[user_id]

    if not context.args:
        await update.message.reply_text(
            "📋 *Watchlist Komutları:*\n\n"
            "• `/watch add <adres>` — Token ekle\n"
            "• `/watch list` — Listeyi gör\n"
            "• `/watch remove <adres>` — Token çıkar",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    action = context.args[0].lower()

    if action == "list":
        watchlist = user.get("watchlist", [])
        if not watchlist:
            await update.message.reply_text("📋 Watchlist'in boş\\. `/watch add <adres>` ile ekle\\.", parse_mode=ParseMode.MARKDOWN_V2)
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
            await update.message.reply_text("❌ Geçersiz adres\\.", parse_mode=ParseMode.MARKDOWN_V2)
            return

        if address in user.get("watchlist", []):
            await update.message.reply_text("ℹ️ Bu token zaten watchlist'inde\\.", parse_mode=ParseMode.MARKDOWN_V2)
            return

        if len(user.get("watchlist", [])) >= 10:
            await update.message.reply_text("❌ Watchlist limiti: 10 token\\.", parse_mode=ParseMode.MARKDOWN_V2)
            return

        user.setdefault("watchlist", []).append(address)
        short = f"{address[:6]}...{address[-4:]}"
        await update.message.reply_text(
            f"✅ `{_escape(short)}` watchlist'e eklendi\\!\n"
            f"📋 Toplam: {len(user['watchlist'])} token",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    if action == "remove" and len(context.args) >= 2:
        address = context.args[1].strip()
        wl = user.get("watchlist", [])
        if address in wl:
            wl.remove(address)
            await update.message.reply_text("✅ Token watchlist'ten çıkarıldı\\.", parse_mode=ParseMode.MARKDOWN_V2)
        else:
            await update.message.reply_text("❌ Bu token watchlist'inde yok\\.", parse_mode=ParseMode.MARKDOWN_V2)
        return

    await update.message.reply_text("❓ Geçersiz komut\\. `/watch add|remove|list` kullan\\.", parse_mode=ParseMode.MARKDOWN_V2)


# ── /pro ────────────────────────────────────────────────

async def pro_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Pro plan bilgisi."""
    await update.message.reply_text(
        "⭐ *ChainGuard Pro*\n\n"
        f"📊 Günlük {PRO_LIMIT} sorgu \\(Free: {FREE_LIMIT}\\)\n"
        "🔔 Watchlist uyarıları\n"
        "📈 Öncelikli analiz\n"
        "🎯 Affiliate kazanç\n\n"
        "_Pro abonelik yakında Telegram Stars ile aktif olacak\\!_\n\n"
        "Şimdilik Free planla devam et 🚀",
        parse_mode=ParseMode.MARKDOWN_V2,
    )


# ── Callback Queries ────────────────────────────────────

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Inline buton işleyicisi."""
    query = update.callback_query
    await query.answer()
    data = query.data

    if data.startswith("analyze_"):
        address = data.replace("analyze_", "")
        user_id = query.from_user.id

        allowed, remaining = check_rate_limit(user_id)
        if not allowed:
            await query.edit_message_text(
                f"⏳ Günlük limit doldu \\({FREE_LIMIT}/gün\\)\\.",
                parse_mode=ParseMode.MARKDOWN_V2,
            )
            return

        await query.edit_message_text(
            "⏳ *Analiz ediliyor\\.\\.\\.*",
            parse_mode=ParseMode.MARKDOWN_V2,
        )

        result = await fetch_analysis(address)
        if not result:
            await query.edit_message_text("❌ Analiz başarısız\\.", parse_mode=ParseMode.MARKDOWN_V2)
            return

        token = result.get("token", {})
        score = result.get("score", {})
        total = score.get("total", 0)
        emoji = risk_emoji(total)
        name = token.get("name", "Unknown")
        symbol = token.get("symbol", "???")

        keyboard = [
            [InlineKeyboardButton("🌐 Detaylı Analiz", url=f"{WEB_URL}/token/{address}")],
        ]

        await query.edit_message_text(
            f"{emoji} *{_escape(name)}* \\(${_escape(symbol)}\\)\n"
            f"Risk Skoru: *{total:.0f}/100* — {_escape(score.get('label_tr', ''))}",
            parse_mode=ParseMode.MARKDOWN_V2,
            reply_markup=InlineKeyboardMarkup(keyboard),
        )

    elif data.startswith("watch_add_"):
        address = data.replace("watch_add_", "")
        user_id = query.from_user.id
        user = user_queries[user_id]

        if address not in user.get("watchlist", []):
            user.setdefault("watchlist", []).append(address)
            await query.answer("✅ Watchlist'e eklendi!", show_alert=True)
        else:
            await query.answer("ℹ️ Zaten watchlist'inde.", show_alert=True)


# ── Escape helper ───────────────────────────────────────

def _escape(text: str) -> str:
    """MarkdownV2 için özel karakterleri escape et."""
    special = r"_*[]()~`>#+-=|{}.!"
    result = ""
    for ch in str(text):
        if ch in special:
            result += "\\" + ch
        else:
            result += ch
    return result


# ── Main ────────────────────────────────────────────────

def main():
    if not BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN ortam değişkeni ayarlanmamış!")
        return

    app = Application.builder().token(BOT_TOKEN).build()

    # Komut handler'ları
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("analyze", analyze_command))
    app.add_handler(CommandHandler("watch", watch_command))
    app.add_handler(CommandHandler("pro", pro_command))

    # Callback query handler
    app.add_handler(CallbackQueryHandler(button_callback))

    logger.info("🤖 ChainGuard Bot başlatılıyor...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
