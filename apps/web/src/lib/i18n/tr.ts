export const tr = {
  nav: {
    how: "Nasıl Çalışır?",
    trending: "Trending",
    learn: "Eğitim",
    api: "API",
    telegram: "Telegram",
  },
  home: {
    badge: "Solana Token Risk Skoru · Güvenlik Analizi · Wash Trading Tespiti",
    h1_main: "Taranoid",
    h1_sub: "Risk Skoru & Token Analiz Motoru",
    hero_sub: "Solana tokenlarına yatırım yapmadan önce riskleri test edin. Kapsamlı dolandırıcılık testi, wash trading, cüzdan kümeleme ve Sybil ağlarını tek tıkla saniyeler içinde tespit edin.",
    placeholder: "Solana veya EVM token adresi yapıştır...",
    btn_analyze: "Analiz Et",
    try_label: "Dene:",
    scroll: "Keşfet",
    features_badge: "Analiz Motoru",
    features_title: "9 Metrik, Tek Karar",
    features_sub: "Her tokeni 9 farklı açıdan analiz eden makine öğrenimi destekli risk motoru.",
    cta_title: "Telegram Bot ile Her Yerde Analiz",
    cta_sub: "komutunu gönder, 9 metrikli risk raporu saniyeler içinde gelsin.",
    cta_button: "Botu Başlat",
    cta_free: "Ücretsiz · Günlük 5 analiz",
    error_required: "Token adresi gerekli.",
    error_invalid: "Geçersiz token adresi. Solana (base58) veya EVM (0x...) adresi girin.",
  },
  stats: [
    { value: "9", label: "Risk Metriği", sub: "kapsamlı analiz" },
    { value: "<3s", label: "Analiz Süresi", sub: "cached token" },
    { value: "7/24", label: "Canlı İzleme", sub: "kesintisiz" },
    { value: "10K+", label: "Holder Tarama", sub: "per token" },
  ],
  features: [
    {
      emoji: "🔗",
      title: "Cüzdan Kümeleme",
      desc: "Graf analizi ile sahte holder ağlarını gerçek zamanlı tespit et. 400 sahte cüzdanı tek seferde yakala.",
      tag: "AI Analiz",
    },
    {
      emoji: "🔄",
      title: "Wash Trading",
      desc: "A→B→C→A döngüsel işlem paternlerini ve sahte hacim şişirmeyi saniyeler içinde algıla.",
      tag: "Döngü Tespiti",
    },
    {
      emoji: "🤖",
      title: "Sybil & Bundler",
      desc: "Bot kontrollü cüzdanlar ve Jito bundle ile toplu dağıtım paternlerinin tespiti.",
      tag: "Bot Koruması",
    },
    {
      emoji: "📉",
      title: "Kademeli Çıkış",
      desc: "Balina cüzdanlarının koordineli satış stratejilerini erken aşamada tespit et.",
      tag: "Whale Tracker",
    },
    {
      emoji: "📐",
      title: "Bonding Curve",
      desc: "Pump.fun'dan Raydium'a geçiş anındaki manipülasyon paternlerini analiz et.",
      tag: "Pump.fun",
    },
    {
      emoji: "⚡",
      title: "Anlık Risk Skoru",
      desc: "9 metriği ağırlıklı olarak birleştiren, 0-100 arası tek skor. Hızlı karar, net sonuç.",
      tag: "9 Metrik",
    },
  ],
  footer: {
    tagline: "© 2026 Taranoid — Yatırım tavsiyesi değildir. DYOR.",
    links: ["Telegram", "Eğitim", "API", "Hakkımızda"],
  },
  learn: {
    badge: "Eğitim Merkezi",
    h1_main: "Kripto Güvenliği",
    h1_sub: "Öğren",
    desc: "Memecoin dolandırıcılıklarını, rug pull'ları ve manipülasyon tekniklerini öğren. Gerçek vakalar, blockchain verileriyle desteklenmiş.",
    lessons: [
      {
        tag: "Ders 1",
        title: "Memecoin 101",
        desc: "Memecoin nedir, rug pull nasıl çalışır, hangi sinyaller tehlike işareti? Yeni başlayanlar için kapsamlı rehber.",
        readTime: "8 dk okuma",
      },
      {
        tag: "Ders 2",
        title: "Wash Trading Tespiti",
        desc: "Yapay hacim nasıl oluşturulur? A→B→C→A döngüleri nedir? VLR metriki bu sinyalleri nasıl yakalar?",
        readTime: "6 dk okuma",
      },
      {
        tag: "Ders 3",
        title: "Cüzdan Kümeleme & Sybil Attack",
        desc: "Bir kişi 400 farklı cüzdan açıp sahte holder sayısı nasıl şişirir? Blockchain grafı analizi nasıl çalışır?",
        readTime: "7 dk okuma",
      },
      {
        tag: "Vaka Çalışması",
        title: "PIPPINU Analizi",
        desc: "Gerçek bir rug pull'un adım adım anatomisi. Token oluşturma → sahte holder → pump → dump → %97 kayıp.",
        readTime: "10 dk okuma",
      }
    ],
    read_btn: "Okumaya Başla →",
    cta_title: "Ajan sistemini test et.",
    cta_desc: "Bir token adresini analiz et ve 9 metrikle gerçek riski gör.",
    btn_analyze: "Analiz Et",
    disclaimer: "Tüm içerikler eğitim amaçlıdır. DYOR.",
  },
  learn_wash_trading: {
    meta_title: "Wash Trading Nedir, Nasıl Tespit Edilir? | Taranoid",
    meta_desc: "Solana ve kripto paralar üzerinde wash trading nasıl yapılır? Taranoid'ın VLR (Volume/Liquidity Ratio) ve döngüsel hacim tespiti algoritmalarını öğrenin.",
    read_time: "6 dk okuma",
    h1: "🔄 Wash Trading Tespiti",
    intro: "Milyonlarca dolarlık \"hacim\" nasıl saatte yerden biter? Aynı paranın döngüde kullanılmasını ve Taranoid'ın bunu nasıl tespit ettiğini öğren.",
    sections: {
      what_is_it: {
        title: "Wash Trading Nedir?",
        p1: "Wash trading, aynı kişi veya koordineli bir grubun kendi kendine alım-satım yaparak yapay hacim oluşturmasıdır. A cüzdanı B'ye satar, B cüzdanı C'ye, C cüzdanı tekrar A'ya. Sonuç: 3 işlem, ama gerçekte hiçbir para el değiştirmemiş.",
        example_title: "Döngü Örneği",
        example_flow: ["Cüzdan A", "→", "Cüzdan B", "→", "Cüzdan C", "→", "Cüzdan A"],
        example_caption: "Blockchain'de 3 işlem görünür → Borsa \"yüksek hacim\" gösterir → Yatırımcı ilgi duyar"
      },
      why_do_it: {
        title: "Neden Yapılır?",
        items: [
          { icon: "📈", title: "Algı Yaratmak", desc: "Yüksek hacim = popüler token algısı. CoinGecko/DEXScreener'da üst sıralara çıkmak." },
          { icon: "🎯", title: "FOMO Yaratmak", desc: "$5M günlük hacim gören yatırımcı 'kaçırmayayım' diye alım yapar." },
          { icon: "💰", title: "Pump Hazırlığı", desc: "Sahte aktivite oluşturduktan sonra tokenı dump etmek için zemin hazırlamak." }
        ]
      },
      vlr: {
        title: "VLR — Hacim / Likidite Oranı",
        p1: "Taranoid'ın en önemli metrigi VLR (Volume/Liquidity Ratio), wash trading'i şu formülle yakalar:",
        code: "VLR = 24s Hacim ÷ Likidite Havuzu\n\nÖrnek 1 (Normal):\n  Hacim: $500K    Likidite: $200K    VLR = 2.5x ✅\n\nÖrnek 2 (Şüpheli):\n  Hacim: $8M      Likidite: $80K     VLR = 100x ⚠️\n\nÖrnek 3 (Kritik):\n  Hacim: $50M     Likidite: $50K     VLR = 1000x 🚨",
        ranges: [
          { range: "VLR < 10x", label: "Normal", color: "#34D399" },
          { range: "VLR 10–50x", label: "Şüpheli", color: "#FBBF24" },
          { range: "VLR 50–200x", label: "Yüksek Risk", color: "#FB923C" },
          { range: "VLR > 200x", label: "Neredeyse Kesin Wash", color: "#F87171" }
        ]
      },
      other_signals: {
        title: "Diğer Tespit Sinyalleri",
        items: [
          { icon: "⏱️", title: "30 Saniyede Geri-İleri", desc: "Aynı iki cüzdan arasında 30 saniyeden kısa aralıklarla yapılan çok sayıda işlem. İnsan davranışı değil." },
          { icon: "💯", title: "Aynı Miktar ±%5", desc: "100 SOL → 100.3 SOL → 99.8 SOL şeklinde dönen para. Tolerans eklenerek 'gerçekmiş gibi' gösterilir." },
          { icon: "🌙", title: "Gece Saati Aktivitesi", desc: "Türkiye saatiyle 03:00–06:00 arası anormal yüksek hacim. Bot çalışıyor, insan uyuyor." },
          { icon: "👻", title: "Az Unique Cüzdan", desc: "10.000 işlem ama sadece 15 farklı cüzdan. Gerçek piyasada yüzlerce farklı alıcı olur." }
        ]
      }
    },
    score_box: {
      title: "🛡️ Taranoid Wash Trading Skoru",
      desc: "VLR + döngü tespiti + unique cüzdan oranı birleştirilerek 0–100 arası wash trading skoru hesaplanır. Skor 60+'ı geçen tokenlarda anlamlı wash trading tespit edilmiş demektir."
    },
    cta: {
      title: "Şüpheli bir token gördün mü?",
      desc: "Adresi gir, VLR ve wash trading skorunu anında gör.",
      btn: "Token Analiz Et"
    },
    share: "Bu dersi paylaş:",
    share_btn: "Telegram'da Paylaş"
  },
  learn_memecoin_101: {
    meta_title: "Memecoin 101: Rug Pull Nedir, Nasıl Çalışır? | Taranoid",
    meta_desc: "Memecoin nedir ve rug pull dolandırıcılığı nasıl yapılır? Pump.fun üzerindeki sahte projelere karşı Taranoid risk metriklerini öğren.",
    read_time: "8 dk okuma",
    h1: "🎓 Memecoin 101",
    intro: "Memecoin nedir, nasıl çalışır ve insanlar neden kaybeder? Bu derste rug pull mekanizmasını ve tehlike sinyallerini öğreneceksin.",
    sections: {
      what_is_it: {
        title: "Memecoin Nedir?",
        p1: "Memecoin, genellikle internet meme'lerine veya viral içeriklere dayanan kripto para birimidir. DOGE, SHIB, PEPE bunların en tanınmış örnekleri. Ancak günde yüzlerce yeni memecoin piyasaya çıkıyor ve çoğu dolandırıcılık amacıyla tasarlanmış.",
        cards: [
          { label: "Meşru Memecoin", items: ["Gerçek topluluk desteği", "Şeffaf geliştirici", "Büyük borsalarda listelendi", "Uzun süredir var"], color: "#34D399" },
          { label: "Sahte Memecoin", items: ["Anonim ekip", "Hızlı pump & dump", "Sosyal medya botu ordusu", "Kısa ömürlü hype"], color: "#F87171" }
        ]
      },
      how_it_works: {
        title: "Rug Pull Nasıl Çalışır?",
        p1: "Rug pull, geliştiricilerin yatırımcıların parasını alıp kaçmasıdır. Tipik senaryo:",
        steps: [
          { step: "1", title: "Token Oluştur", desc: "Pump.fun'da 2-3 dakikada token açılır. Maliyet: ~0.02 SOL. Toplam arz birkaç kişinin elinde.", color: "#818CF8" },
          { step: "2", title: "Sahte Topluluk Kur", desc: "Telegram/Discord grubu açılır. Bot hesaplarla şişirilir. 'Büyük proje' izlenimi yaratılır.", color: "#FBBF24" },
          { step: "3", title: "Holder Sayısını Şişir", desc: "Aynı kişiye ait yüzlerce cüzdan token alır. 'Binlerce holder var' algısı oluşturulur.", color: "#FB923C" },
          { step: "4", title: "Pump Yap", desc: "Koordineli alımlarla fiyat yapay olarak yükselir. Sosyal medyada '100x fırsat' paylaşımları yapılır.", color: "#F87171" },
          { step: "5", title: "Dump Et & Kaç", desc: "Geliştirici tüm tokenlarını satar. Fiyat %90-99 düşer. Proje terk edilir.", color: "#EF4444" }
        ]
      },
      red_flags: {
        title: "Tehlike Sinyalleri",
        items: [
          { signal: "🔴 Anonim geliştirici", detail: "Kim olduğunu bilmediğin birine para veriyorsun. Doğrulanmış kimlik yoksa risk çok yüksek." },
          { signal: "⚠️ Az holder, yüksek yoğunlaşma", detail: "100'den az holder veya top 10 cüzdanın supply'ın %80+'ını tutması — satış anında fiyat çöker." },
          { signal: "🚨 Çok hızlı yükseliş", detail: "Token açılışından itibaren dakikalar içinde %1000+ yükseliş. Gerçek değil, koordineli pump." },
          { signal: "🤖 Bot aktivitesi", detail: "Telegram'da sürekli aynı mesajları atan hesaplar, Twitter'da anlamsız RT şişirmesi." },
          { signal: "🔒 Kilitli likidite yok", detail: "Likidite kilitlenmemişse geliştirici dilediği zaman havuzu boşaltabilir." }
        ]
      }
    },
    info_boxes: {
      golden_rule: {
        title: "Altın Kural",
        desc: "FOMO (kaçırma korkusu) ile alım yapma. Eğer bir token sana '10 dakikada 10x' vaat ediyorsa, büyük ihtimalle sen zaten onların çıkış likiditesisin."
      },
      what_taranoid_does: {
        title: "Taranoid Ne Yapar?",
        desc: "Bir token adresini girerek VLR (wash trading), cüzdan kümeleme (sahte holder), Sybil attack ve 6 metrik daha ile saniyeler içinde risk skoru alabilirsin. 0 = güvenli, 100 = kritik risk."
      }
    },
    cta: {
      title: "Öğrendiklerini test et",
      desc: "Merak ettiğin bir tokenı analiz et ve risk skorunu gör.",
      btn: "Token Analiz Et"
    },
    share: "Bu dersi paylaş:",
    share_telegram: "Telegram'da Paylaş",
    share_x: "X'te Paylaş"
  },
  learn_wallet_clustering: {
    meta_title: "Cüzdan Kümeleme ve Sybil Attack Skoru | Taranoid",
    meta_desc: "Blockchain graf analizi ile sahte holder sayılarını tespit edin. Taranoid'ın cüzdan kümeleme algoritması cüzdan ağlarını nasıl çıkarıyor?",
    read_time: "7 dk okuma",
    h1: "🔗 Cüzdan Kümeleme & Sybil Attack",
    intro: "400 cüzdan aslında tek kişi olabilir. Blockchain grafı analizi ile sahte holder şişirmesini nasıl tespit ederiz?",
    sections: {
      problem: {
        title: "Problem: Sahte Holder Şişirmesi",
        p1: "Bir token \"5.000 holder\" gösteriyorsa güvenli görünür. Ama bu 5.000 holderın 4.000'i aynı kişiye aitse? Blockchain üzerinde her cüzdanı ayrı bir kimlik olarak görmek mümkün değil — ya da öyle sanılıyordu.",
        case_title: "Gerçek Dünya Örneği: PIPPINU",
        stats: [
          { label: "Görünen Holder", value: "380+", sub: "cüzdan" },
          { label: "Gerçek Kişi", value: "~3-5", sub: "kişi tahmini" },
          { label: "Sahte Oran", value: "%99", sub: "sahte holder" }
        ]
      },
      how_it_works: {
        title: "Kümeleme Nasıl Çalışır?",
        p1: "Taranoid 4 farklı sinyal kullanarak aynı kişiye ait cüzdanları tespit eder:",
        steps: [
          { step: "1", color: "#818CF8", title: "Funding Graph — Kim Kimi Finanse Etti?", desc: "Her cüzdanın ilk SOL transferi 3 seviye geriye kadar izlenir. Aynı kaynak cüzdandan fonlananlar = muhtemelen aynı kişi.", example: "Ana Cüzdan → 50 alt cüzdana 0.01 SOL transfer → Bu 50 cüzdan token alır" },
          { step: "2", color: "#FBBF24", title: "Timing Cluster — Aynı Anda Doğanlar", desc: "Aynı 5 dakika içinde oluşturulan 10+ cüzdan otomatik olarak şüpheli sayılır. İnsan 5 dakikada 10 cüzdan açamaz.", example: "15:42:03 → Cüzdan 1 oluştu\n15:43:17 → Cüzdan 2 oluştu\n15:44:55 → Cüzdan 3 oluştu ... → Script!" },
          { step: "3", color: "#FB923C", title: "Behavioral Similarity — Aynı Davranış", desc: "Benzer miktarlarda (±%5 tolerans), benzer zaman aralıklarında işlem yapan cüzdanlar eşleştirilir.", example: "Cüzdan A: 1000 token → 5dk sonra satar\nCüzdan B: 1000 token → 5dk sonra satar → Bot!" },
          { step: "4", color: "#F87171", title: "Connected Components — Graf Analizi", desc: "Bu 3 sinyal birleştirilerek bir ağ (graph) oluşturulur. Birbirine bağlı cüzdan grupları = bir küme = bir kişi.", example: "Küme 1: 380 cüzdan → Supply'ın %67'si\nKüme 2: 12 cüzdan → Supply'ın %8'i" }
        ]
      },
      sybil: {
        title: "Sybil Attack Nedir?",
        p1: "Sybil attack, bir kişinin çok sayıda sahte kimlik oluşturarak sistemi kandırmasıdır. Kripto dünyasında en yaygın kullanım: airdrop farming ve holder sayısı şişirme.",
        items: [
          { signal: "Cüzdan yaşı < 24 saat", risk: "%70+ yeni → +35 puan" },
          { signal: "Tek token cüzdanı", risk: "%60+ tek token → +25 puan" },
          { signal: "Benzer SOL bakiyesi", risk: "0.001–0.003 SOL → +20 puan" },
          { signal: "Holder ani düşüş", risk: "10dk'da %50 düşüş → +30 puan" }
        ]
      }
    },
    info_box: {
      title: "✅ Gerçek holder = gerçek güven",
      desc: "Kümeleme analizi sıfır çıkan bir tokende holderlar gerçekten bağımsız kişilerdir. Bu tek başına büyük bir güven sinyalidir — ama yeterli değil, diğer 8 metriği de kontrol et."
    },
    cta: {
      title: "Gerçek vaka: PIPPINU'yu gör",
      desc: "380 sahte holderın tespiti adım adım.",
      btn: "Vakayı İncele →"
    }
  },
  learn_case_pippinu: {
    meta_title: "PIPPINU Rug Pull Analizi Vaka Çalışması | Taranoid",
    meta_desc: "Gerçek bir rug pull dolandırıcılığı nasıl gerçekleşti? PIPPINU projesinin blockchain analizini ve sahte tutucu tespitini adım adım inceleyin.",
    badge: "Vaka Çalışması",
    read_time: "10 dk okuma",
    h1: "🔍 PIPPINU Rug Pull Analizi",
    intro: "380 sahte cüzdan, %97 kayıp, 72 saat. Gerçek bir rug pull'un adım adım anatomisi — Taranoid hangi sinyalleri, ne zaman tespit etti?",
    summary: {
      title: "Vaka Özeti",
      stats: [
        { label: "Taranoid Skoru", value: "87", sub: "/ 100 risk", color: "#F87171" },
        { label: "Gerçek Holder", value: "~4", sub: "kişi tahmini", color: "#FBBF24" },
        { label: "Sahte Cüzdan", value: "376+", sub: "kümelenmiş", color: "#FB923C" },
        { label: "Kayıp", value: "%97", sub: "72 saatte", color: "#EF4444" }
      ],
      note: "Not: Bu vaka gerçek blockchain manipülasyon örüntülerinden oluşturulmuş eğitim amaçlı analizdir."
    },
    sections: {
      timeline: {
        title: "Olayların Kronolojisi",
        steps: [
          { time: "Saat 0 — Başlangıç", event: "Token Pump.fun'da Oluşturuldu", detail: "PIPPINU tokeni ~0.02 SOL maliyet ile Pump.fun üzerinde açıldı. Toplam arzın %80'i 2 cüzdanda toplanmış halde başladı. Başlangıç likiditesi: $1.200.", color: "#818CF8", icon: "●" },
          { time: "Saat 0–2", event: "Sahte Holder Şişirme — Faz 1", detail: "Ana cüzdandan 200'den fazla alt cüzdana 0.001–0.003 SOL arası küçük transferler yapıldı. Her alt cüzdan hemen PIPPINU aldı. Görünür holder sayısı 12'den 240'a çıktı.", color: "#FBBF24", icon: "●" },
          { time: "Saat 2–6", event: "Sahte Hacim — Wash Trading", detail: "30 cüzdan arasında döngüsel alım-satım başladı. VLR 340x'e ulaştı (likidite $3.500, 24s hacim $1.2M). DEXScreener'da 'Trending' listesine girdi.", color: "#FB923C", icon: "●" },
          { time: "Saat 6", event: "Sosyal Medya Kampanyası", detail: "Telegram kanalında '1000x gem buldum' mesajları yayıldı. Bot hesaplar tarafından koordineli paylaşımlar yapıldı. Gerçek yatırımcılar almaya başladı.", color: "#F59E0B", icon: "●" },
          { time: "Saat 6–24", event: "Pump Fazı — Fiyat Zirvesi", detail: "Gerçek yatırımcıların girişiyle fiyat başlangıçtan +1400% yükseldi. Market cap ~$180.000'e ulaştı. Sahte holderlar hâlâ supply'ın %67'sini tutuyordu.", color: "#34D399", icon: "●" },
          { time: "Saat 24–48", event: "Kademeli Dump Başladı", detail: "Sahte cüzdanlar birer birer satmaya başladı — fark edilmemek için 10–30 dakika arayla. Her satışta fiyat bir miktar düştü. Likidite yavaş yavaş boşaldı.", color: "#F87171", icon: "●" },
          { time: "Saat 72", event: "Rug Pull Tamamlandı", detail: "Tüm sahte cüzdanlar satışını tamamladı. Geliştirici likidite havuzunu kapattı. Fiyat zirveden %97 düştü. Telegram kanalı silindi.", color: "#EF4444", icon: "●" }
        ]
      },
      metrics: {
        title: "Taranoid Metrikleri — Anlık Tablo",
        p1: "Token açılışından 2 saat sonra Taranoid tarafından analiz edildiğinde gösterilen metrikler:",
        table_header: "Metrik Detayları",
        rows: [
          { label: "VLR (Volume/Liquidity)", value: "340x", sub: "Normal: <10x", color: "#F87171" },
          { label: "Holder Sayısı", value: "247", sub: "Gerçek: ~4 kişi", color: "#F87171" },
          { label: "Küme Skoru", value: "94/100", sub: "376 cüzdan, 2 küme", color: "#EF4444" },
          { label: "Wash Trading", value: "78/100", sub: "Döngüsel işlem tespit", color: "#F87171" },
          { label: "Sybil Attack", value: "91/100", sub: "Timing + funding analizi", color: "#EF4444" },
          { label: "RLS (Rug Likidite)", value: "82/100", sub: "Kilitsiz likidite", color: "#F87171" },
          { label: "Top 10 Konsantrasyon", value: "%89", sub: "Kritik eşik: %60", color: "#F87171" },
          { label: "Token Yaşı", value: "2 saat", sub: "<24 saat: yüksek risk", color: "#FB923C" }
        ],
        score: {
          value: "87",
          label: "Genel Risk Skoru",
          desc: "Pump fazına girmeden 4 saat önce bu skoru görmek mümkündü"
        }
      },
      clustering: {
        title: "Cüzdan Kümeleme — Detaylı Bulgular",
        p1: "Funding graph analizi 4 aşamalı bir dağıtım ağı ortaya çıkardı:",
        clusters: [
          { title: "Küme 1 — Ana Operatör", wallets: 1, supply: "%42", desc: "Tüm operasyonu finanse eden master cüzdan. Diğer tüm cüzdanlara SOL gönderdi.", color: "#EF4444" },
          { title: "Küme 2 — Dağıtım Katmanı", wallets: 8, supply: "%25", desc: "Master cüzdandan fonlanan 8 ara cüzdan. Bunlar da alt cüzdanlara dağıtım yaptı.", color: "#F87171" },
          { title: "Küme 3 — Sahte Holderlar", wallets: 243, supply: "%28", desc: "Dağıtım cüzdanlarından fonlanan ve holder sayısı şişirmek için kullanılan cüzdanlar.", color: "#FB923C" },
          { title: "Gerçek Holderlar", wallets: 124, supply: "%5", desc: "Sosyal medya kampanyasına kanan ve gerçekten satın alan bağımsız kullanıcılar.", color: "#34D399" }
        ],
        code: "Tespit edilen bağlantı sinyalleri:\n• Funding: 252 cüzdan → tek kaynaktan finanse\n• Timing: 180 cüzdan → 47 dakikada oluşturuldu\n• Behavioral: 230 cüzdan → ±%3 benzer miktar\n• Graph: 2 bağlı bileşen (supply'ın %95'i)"
      },
      lessons: {
        title: "Bu Vakadan Çıkarılan 5 Ders",
        items: [
          { num: "1", lesson: "Holder sayısı yanıltıcıdır", detail: "247 görünen holder gerçekte 4 kişiydi. Sayıya değil, kümeleme analizine bak.", color: "#818CF8" },
          { num: "2", lesson: "VLR >50x = acil uyarı", detail: "340x VLR fiziksel olarak imkânsız. Bu kadar yüksek oran kesinlikle wash trading gösterir.", color: "#FBBF24" },
          { num: "3", lesson: "Kademeli dump daha tehlikelidir", detail: "Ani dump yerine 24 saat boyunca yavaş satış — fark etmek için aktif izleme gerekir.", color: "#FB923C" },
          { num: "4", lesson: "Trending listesi = dikkat sinyali", detail: "Wash trading ile trending'e girmek kolaydır. Trend olan token daha az şüpheyle incelenir — bu bir avantaj.", color: "#F87171" },
          { num: "5", lesson: "2 saat önce tespit mümkündü", detail: "Token açıldıktan 2 saat sonra tüm sinyaller zaten mevcuttu. Pump'a girmeden önce kontrol etmek kârı kurtarır.", color: "#34D399" }
        ]
      }
    },
    conclusion: {
      title: "Korunmanın tek yolu: veriyle karar vermek",
      desc: "PIPPINU örneği bize şunu öğretiyor: sezgi, sosyal medya ve FOMO yetersizdir. Blockchain verisi yalan söylemez. Kümeleme, VLR ve konsantrasyon skorları gerçeği milisaniyeler içinde ortaya koyar — eğer nereye bakacağını bilirsen."
    },
    cta: {
      title: "Şüpheli bir token gördün mü?",
      desc: "87 puanlık riski önceden gör. Token adresi yeter.",
      btn: "Token Analiz Et"
    },
    share: "Bu vakayı paylaş:",
    share_telegram: "Telegram'da Paylaş",
    share_x: "X'te Paylaş"
  }
} as const
