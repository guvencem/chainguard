"""
Taranoid — Sprint 4
Template-based Türkçe Analiz Raporu Üretici

Her token analizi için metrik değerlerine göre
okunabilir Türkçe özet paragraf oluşturur.
"""


def generate_report(
    token_name: str | None,
    token_symbol: str | None,
    score_total: float,
    metrics: dict,
) -> str:
    """
    Metrik değerlerine göre Türkçe analiz raporu üretir.

    Args:
        token_name: Token adı (None olabilir)
        token_symbol: Token sembolü ($XXX formatı için)
        score_total: Toplam risk skoru (0-100)
        metrics: _compute_analysis sonucundaki metrik dict'i

    Returns:
        Türkçe analiz paragrafı (string)
    """
    display = f"${token_symbol}" if token_symbol else (token_name or "Bu token")

    # VLR
    vlr_score = metrics.get("vlr", {}).get("score", 0)
    vlr_value = metrics.get("vlr", {}).get("value", 0)

    # Cluster
    cluster_score = metrics.get("cluster", {}).get("score", 0)
    cluster_count = metrics.get("cluster", {}).get("cluster_count", 0)
    largest_pct = metrics.get("cluster", {}).get("largest_pct", 0)

    # Wash
    wash_score = metrics.get("wash", {}).get("score", 0)
    cycles_found = metrics.get("wash", {}).get("cycles_found", 0)

    # Sybil
    sybil_score = metrics.get("sybil", {}).get("score", 0)
    young_pct = metrics.get("sybil", {}).get("young_wallet_pct", 0) * 100

    # Bundler
    bundler_detected = metrics.get("bundler", {}).get("detected", False)
    bundle_count = metrics.get("bundler", {}).get("bundle_count", 0)

    # Exit
    exit_detected = metrics.get("exit", {}).get("detected", False)

    # Holders
    top10_pct = metrics.get("holders", {}).get("top10_concentration", 0) * 100
    holder_count = metrics.get("holders", {}).get("count", 0)

    # RLS
    rls_score = metrics.get("rls", {}).get("score", 0)

    sentences = []

    # ── Giriş cümlesi (risk seviyesine göre) ────────────────
    if score_total < 20:
        sentences.append(
            f"{display} tokeni genel itibarıyla güvenli görünmektedir. "
            f"Analiz edilen 9 metriğin büyük çoğunluğu normal sınırlar içindedir."
        )
    elif score_total < 40:
        sentences.append(
            f"{display} tokeni düşük-orta risk taşımaktadır. "
            f"Dikkat edilmesi gereken bazı sinyaller mevcut olmakla birlikte ciddi bir tehlike belirtisi henüz görünmüyor."
        )
    elif score_total < 60:
        sentences.append(
            f"{display} tokeni orta düzeyde risk taşımaktadır. "
            f"Birden fazla şüpheli sinyal tespit edildi; yatırım öncesinde dikkatli değerlendirme yapılması önerilir."
        )
    elif score_total < 80:
        sentences.append(
            f"{display} tokeni yüksek risk taşımaktadır. "
            f"Birden fazla manipülasyon sinyali tespit edildi ve bu tokenin güvenilirliği ciddi şekilde sorgulanmalıdır."
        )
    else:
        sentences.append(
            f"{display} tokeni kritik düzeyde risk taşımaktadır. "
            f"Olası dolandırıcılık sinyalleri çok sayıda metrikte tespit edildi."
        )

    # ── Metrik bazlı cümleler ────────────────────────────────
    details = []

    if vlr_score > 60:
        details.append(
            f"Hacim/likidite oranı {vlr_value:.0f}x ile normalin ({vlr_value / 10:.0f}x eşiği) çok üzerindedir; "
            f"bu durum yapay hacim döngüsüne işaret eder."
        )

    if cluster_score > 50 and cluster_count > 0:
        details.append(
            f"Cüzdan kümeleme analizi, arzın %{largest_pct:.0f}'ini tek elden kontrol eden "
            f"{cluster_count} şüpheli küme tespit etti."
        )

    if wash_score > 50 and cycles_found > 0:
        details.append(
            f"{cycles_found} döngüsel alım-satım işlemi tespit edildi; "
            f"gösterilen hacimin büyük kısmı gerçek değil."
        )

    if sybil_score > 50:
        details.append(
            f"Holderların %{young_pct:.0f}'i 24 saatten genç cüzdanlara ait; "
            f"bu Sybil saldırısı ile sahte holder şişirmesini gösterir."
        )

    if bundler_detected and bundle_count > 0:
        details.append(
            f"Jito bundle ile toplu token dağıtımı tespit edildi ({bundle_count} bundle); "
            f"koordineli bir operasyon söz konusu olabilir."
        )

    if exit_detected:
        details.append(
            "Büyük cüzdanlarda koordineli kademeli satış sinyali mevcut; "
            "bu klasik bir exit scam hazırlığı olabilir."
        )

    if top10_pct > 70:
        details.append(
            f"İlk 10 holder arzın %{top10_pct:.0f}'ini elinde tutuyor; "
            f"büyük bir satış anında fiyat hızla çöker."
        )

    if rls_score > 60:
        details.append(
            "Likidite/market cap oranı düşük; bu büyük miktarda token satmayı çok güçleştirir."
        )

    if holder_count < 50 and score_total > 40:
        details.append(
            f"Yalnızca {holder_count} holder mevcut; bu denli az dağılım gerçek bir topluluk desteği olmadığına işaret eder."
        )

    if details:
        sentences.append(" ".join(details))

    # ── Kapanış cümlesi ──────────────────────────────────────
    if score_total >= 70:
        sentences.append(
            "Tüm bu sinyaller bir arada değerlendirildiğinde bu tokene yatırım yapılmamasını şiddetle öneririz."
        )
    elif score_total >= 50:
        sentences.append(
            "Küçük pozisyonlar için bile yatırım öncesinde kapsamlı araştırma (DYOR) yapmanızı öneririz."
        )
    elif score_total >= 30:
        sentences.append(
            "Metrikler makul görünse de kripto piyasasının doğasında her zaman risk vardır; kendi araştırmanızı yapın."
        )
    else:
        sentences.append(
            "Analizimize göre bu token görece güvenli; yine de yatırım tavsiyesi değildir."
        )

    return " ".join(sentences)
