export const en = {
  nav: {
    how: "How It Works",
    trending: "Trending",
    learn: "Learn",
    api: "API",
    telegram: "Telegram",
  },
  home: {
    badge: "Solana Token Scanner · Rug Pull Checker · Real-Time Market Auditor",
    h1_main: "Taranoid",
    h1_sub: "Risk Analyzer & Rug Checker",
    hero_sub: "Analyze Solana tokens before investing. A premium rug pull checker detecting wash trading, wallet clustering, Sybil attacks and hidden developer patterns in seconds.",
    placeholder: "Paste token address (Solana, Base, BSC)...",
    btn_analyze: "Analyze",
    try_label: "Try:",
    scroll: "Explore",
    features_badge: "Analysis Engine",
    features_title: "9 Metrics, One Decision",
    features_sub: "ML-powered risk engine that analyzes every token from 9 different angles.",
    cta_title: "Analyze Anywhere with Telegram Bot",
    cta_sub: "Send the command, get a 9-metric risk report in seconds.",
    cta_button: "Start Bot",
    cta_free: "Free · 5 analyses per day",
    error_required: "Token address is required.",
    error_invalid: "Invalid token address. Enter a Solana (base58) or EVM (0x...) address.",
  },
  stats: [
    { value: "9", label: "Risk Metrics", sub: "comprehensive" },
    { value: "<3s", label: "Analysis Time", sub: "cached token" },
    { value: "24/7", label: "Live Monitoring", sub: "uninterrupted" },
    { value: "10K+", label: "Holder Scan", sub: "per token" },
  ],
  features: [
    {
      emoji: "🔗",
      title: "Wallet Clustering",
      desc: "Detect fake holder networks in real-time using graph analysis. Catch 400 fake wallets at once.",
      tag: "AI Analysis",
    },
    {
      emoji: "🔄",
      title: "Wash Trading",
      desc: "Detect A→B→C→A circular trade patterns and fake volume inflation in seconds.",
      tag: "Cycle Detection",
    },
    {
      emoji: "🤖",
      title: "Sybil & Bundler",
      desc: "Detect bot-controlled wallets and Jito bundle mass distribution patterns.",
      tag: "Bot Protection",
    },
    {
      emoji: "📉",
      title: "Staged Exit",
      desc: "Detect whale wallets' coordinated sell strategies in early stages.",
      tag: "Whale Tracker",
    },
    {
      emoji: "📐",
      title: "Bonding Curve",
      desc: "Analyze manipulation patterns during the pump.fun → Raydium graduation.",
      tag: "Pump.fun",
    },
    {
      emoji: "⚡",
      title: "Instant Risk Score",
      desc: "A single 0-100 score combining 9 weighted metrics. Fast decision, clear result.",
      tag: "9 Metrics",
    },
  ],
  footer: {
    tagline: "© 2026 Taranoid — Not investment advice. DYOR.",
    links: ["Telegram", "Learn", "API", "About"],
  },
  learn: {
    badge: "Education Center",
    h1_main: "Crypto Security",
    h1_sub: "Learn",
    desc: "Learn about memecoin scams, rug pulls, and manipulation techniques. Real-world case studies backed by on-chain data.",
    lessons: [
      {
        tag: "Lesson 1",
        title: "Memecoin 101",
        desc: "What is a memecoin, how do rug pulls work, and what are the red flags? A comprehensive guide for beginners.",
        readTime: "8 min read",
      },
      {
        tag: "Lesson 2",
        title: "Wash Trading Detection",
        desc: "How is artificial volume created? What are A→B→C→A cycles? How does the VLR metric catch these signals?",
        readTime: "6 min read",
      },
      {
        tag: "Lesson 3",
        title: "Wallet Clustering & Sybil Attack",
        desc: "How does one person open 400 wallets to inflate holder count? How does blockchain graph analysis work?",
        readTime: "7 min read",
      },
      {
        tag: "Case Study",
        title: "PIPPINU Analysis",
        desc: "Step-by-step anatomy of a real rug pull. Token creation → fake holders → pump → dump → 97% loss.",
        readTime: "10 min read",
      }
    ],
    read_btn: "Start Reading →",
    cta_title: "Test the Agent System.",
    cta_desc: "Analyze a token address and see the real risk using 9 metrics.",
    btn_analyze: "Analyze",
    disclaimer: "All content is for educational purposes. DYOR.",
  },
  learn_wash_trading: {
    meta_title: "What is Wash Trading and How to Detect it? | Taranoid",
    meta_desc: "How is wash trading done on Solana and crypto tokens? Learn about Taranoid's VLR (Volume/Liquidity Ratio) and cyclical volume detection algorithms.",
    read_time: "6 min read",
    h1: "🔄 Wash Trading Detection",
    intro: "How do millions of dollars in 'volume' magically appear out of nowhere? Learn how the same funds are cycled repeatedly and how Taranoid catches it red-handed.",
    sections: {
      what_is_it: {
        title: "What is Wash Trading?",
        p1: "Wash trading is the process of generating artificial trading volume by executing self-trading loops among a coordinated group of wallets. Wallet A sells to B, B sells to C, and C sells back to A. Result: 3 transactions, but no real money has changed hands.",
        example_title: "Cycle Example",
        example_flow: ["Wallet A", "→", "Wallet B", "→", "Wallet C", "→", "Wallet A"],
        example_caption: "3 transactions appear on-chain → Exchange shows 'high volume' → Real investors are lured in"
      },
      why_do_it: {
        title: "Why Do They Do It?",
        items: [
          { icon: "📈", title: "Creating Perception", desc: "High volume = perception of a popular token. Climbing the ranks on CoinGecko/DEXScreener." },
          { icon: "🎯", title: "Triggering FOMO", desc: "An investor seeing $5M daily volume buys in out of fear of missing out (FOMO)." },
          { icon: "💰", title: "Pre-Pump Preparation", desc: "Setting the stage to dump the token on retail buyers after creating fake network activity." }
        ]
      },
      vlr: {
        title: "VLR — Volume / Liquidity Ratio",
        p1: "Taranoid's most crucial metric is VLR (Volume/Liquidity Ratio), which flags wash trading using the following formula:",
        code: "VLR = 24h Volume ÷ Liquidity Pool\n\nExample 1 (Normal):\n  Volume: $500K    Liquidity: $200K    VLR = 2.5x ✅\n\nExample 2 (Suspicious):\n  Volume: $8M      Liquidity: $80K     VLR = 100x ⚠️\n\nExample 3 (Critical):\n  Volume: $50M     Liquidity: $50K     VLR = 1000x 🚨",
        ranges: [
          { range: "VLR < 10x", label: "Normal", color: "#34D399" },
          { range: "VLR 10–50x", label: "Suspicious", color: "#FBBF24" },
          { range: "VLR 50–200x", label: "High Risk", color: "#FB923C" },
          { range: "VLR > 200x", label: "Almost Certainly Wash Trading", color: "#F87171" }
        ]
      },
      other_signals: {
        title: "Other Detection Signals",
        items: [
          { icon: "⏱️", title: "Back-to-Back <30s", desc: "Dozens of transactions bouncing between the same two wallets in under 30 seconds. Not human behavior." },
          { icon: "💯", title: "Exact Amounts ±5%", desc: "Funds circling as 100 SOL → 100.3 SOL → 99.8 SOL. Tolerance is added to make it look 'organic'." },
          { icon: "🌙", title: "Late Night Activity", desc: "Anomalously high volume between 03:00–06:00 local time. The bot is working while humans sleep." },
          { icon: "👻", title: "Few Unique Wallets", desc: "10,000 transactions but only 15 unique wallets. A real market has hundreds of different buyers." }
        ]
      }
    },
    score_box: {
      title: "🛡️ Taranoid Wash Trading Score",
      desc: "By combining VLR + loop detection + unique wallet ratio, a wash trading score from 0–100 is calculated. Tokens passing a score of 60+ have significant wash trading detected."
    },
    cta: {
      title: "Did you spot a suspicious token?",
      desc: "Enter the address and instantly see the VLR and the true wash trading score.",
      btn: "Analyze Token"
    },
    share: "Share this lesson:",
    share_btn: "Share on Telegram"
  },
  learn_memecoin_101: {
    meta_title: "Memecoin 101: What is a Rug Pull and How it Works | Taranoid",
    meta_desc: "What is a memecoin and how do rug pull scams work? Learn to avoid Pump.fun scams using Taranoid's AI risk metrics.",
    read_time: "8 min read",
    h1: "🎓 Memecoin 101",
    intro: "What is a memecoin, how does it work, and why do people lose money? In this lesson, you will learn the rug pull mechanism and critical red flags.",
    sections: {
      what_is_it: {
        title: "What is a Memecoin?",
        p1: "A memecoin is a cryptocurrency usually based on internet memes or viral themes. DOGE, SHIB, PEPE are well-known examples. But hundreds of new ones launch daily, and most are designed to scam.",
        cards: [
          { label: "Legit Memecoin", items: ["Real community support", "Transparent dev", "Listed on major exchanges", "Existed for a long time"], color: "#34D399" },
          { label: "Fake Memecoin", items: ["Anonymous team", "Rapid pump & dump", "Social media bot army", "Short-lived hype"], color: "#F87171" }
        ]
      },
      how_it_works: {
        title: "How Does a Rug Pull Work?",
        p1: "A rug pull is when developers take investors' money and run. The typical scenario:",
        steps: [
          { step: "1", title: "Token Creation", desc: "A token is launched on Pump.fun in 2 minutes. Cost: ~0.02 SOL. Total supply held by a few people.", color: "#818CF8" },
          { step: "2", title: "Fake Community", desc: "Telegram/Discord groups are opened. Bloated with bot accounts. Illusions of a 'huge project' are created.", color: "#FBBF24" },
          { step: "3", title: "Inflated Holders", desc: "Hundreds of wallets belonging to the same person buy the token. Creating the 'thousands of holders' illusion.", color: "#FB923C" },
          { step: "4", title: "The Pump", desc: "Coordinated buys artificially inflate the price. '100x opportunity' posts are spammed on social media.", color: "#F87171" },
          { step: "5", title: "Dump & Run", desc: "The developer dumps all tokens. Price drops 90-99%. The project is abandoned.", color: "#EF4444" }
        ]
      },
      red_flags: {
        title: "Danger Signals",
        items: [
          { signal: "🔴 Anonymous Developer", detail: "Giving money to someone you don't know. Extremely high risk without a verified identity." },
          { signal: "⚠️ Few Holders, High Concentration", detail: "Less than 100 holders or the top 10 wallets holding 80%+ supply — price collapses on a single sell." },
          { signal: "🚨 Extremely Fast Rise", detail: "1000%+ rise in minutes right after launch. This is not natural, it's a coordinated pump." },
          { signal: "🤖 Bot Activity", detail: "Accounts constantly posting the same messages on Telegram, mindless RT spamming on Twitter." },
          { signal: "🔒 No Locked Liquidity", detail: "If liquidity is not locked, the developer can drain the pool at any second." }
        ]
      }
    },
    info_boxes: {
      golden_rule: {
        title: "Golden Rule",
        desc: "Do not buy out of FOMO. If a token promises '10x in 10 minutes', you are most likely their exit liquidity."
      },
      what_taranoid_does: {
        title: "What Does Taranoid Do?",
        desc: "Enter a token address to instantly receive a risk score analyzing VLR (wash trading), wallet clustering (fake holders), sybil attacks, and 6 more metrics. 0 = safe, 100 = critical risk."
      }
    },
    cta: {
      title: "Test what you've learned",
      desc: "Analyze a token you're curious about and uncover its true risk score.",
      btn: "Analyze Token"
    },
    share: "Share this lesson:",
    share_telegram: "Share on Telegram",
    share_x: "Share on X"
  },
  learn_wallet_clustering: {
    meta_title: "Wallet Clustering and Sybil Attack Score | Taranoid",
    meta_desc: "Detect fake token holders with blockchain transaction graph analysis. Learn how Taranoid's wallet clustering algorithm maps sybil networks.",
    read_time: "7 min read",
    h1: "🔗 Wallet Clustering & Sybil Attack",
    intro: "400 wallets could actually be just one person. How do we detect fake holder inflation using blockchain graph analysis?",
    sections: {
      problem: {
        title: "The Problem: Fake Holder Inflation",
        p1: "If a token shows '5,000 holders', it looks safe. But what if 4,000 of those belong to the same person? It's impossible to see each wallet as a separate identity on the blockchain — or so they thought.",
        case_title: "Real World Example: PIPPINU",
        stats: [
          { label: "Visible Holders", value: "380+", sub: "wallets" },
          { label: "Real People", value: "~3-5", sub: "estimated people" },
          { label: "Fake Ratio", value: "99%", sub: "fake holders" }
        ]
      },
      how_it_works: {
        title: "How Does Clustering Work?",
        p1: "Taranoid uses 4 different signals to detect wallets belonging to the same person:",
        steps: [
          { step: "1", color: "#818CF8", title: "Funding Graph — Who Funded Whom?", desc: "The first SOL transfer of every wallet is traced back 3 levels. Wallets funded from the same source = likely the same person.", example: "Main Wallet → transfers 0.01 SOL to 50 sub-wallets → These 50 wallets buy the token" },
          { step: "2", color: "#FBBF24", title: "Timing Cluster — Born at the Same Time", desc: "10+ wallets created within the same 5 minutes are automatically flagged. A human cannot open 10 wallets in 5 minutes.", example: "15:42:03 → Wallet 1 created\n15:43:17 → Wallet 2 created\n15:44:55 → Wallet 3 created ... → Script!" },
          { step: "3", color: "#FB923C", title: "Behavioral Similarity — Identical Actions", desc: "Wallets making trades with similar amounts (±5% tolerance) and within similar timeframes are matched.", example: "Wallet A: buys 1000 tokens → sells 5 mins later\nWallet B: buys 1000 tokens → sells 5 mins later → Bot!" },
          { step: "4", color: "#F87171", title: "Connected Components — Graph Analysis", desc: "These 3 signals are combined into a network (graph). Connected wallet groups = one cluster = one entity.", example: "Cluster 1: 380 wallets → 67% of Supply\nCluster 2: 12 wallets → 8% of Supply" }
        ]
      },
      sybil: {
        title: "What is a Sybil Attack?",
        p1: "A sybil attack is when a single entity subverts the reputation system of a network by creating a large number of pseudonymous identities. In crypto, the most common uses: airdrop farming and inflating holder count.",
        items: [
          { signal: "Wallet age < 24 hours", risk: "70%+ new → +35 points" },
          { signal: "Single token wallet", risk: "60%+ single token → +25 points" },
          { signal: "Similar SOL balance", risk: "0.001–0.003 SOL → +20 points" },
          { signal: "Sudden holder drop", risk: "50% drop in 10 mins → +30 points" }
        ]
      }
    },
    info_box: {
      title: "Real holders = real trust",
      desc: "If clustering analysis returns zero on a token, the holders are truly independent people. This alone is a massive trust signal — but it's not enough, check the other 8 metrics as well."
    },
    cta: {
      title: "Real case: see PIPPINU",
      desc: "Step-by-step detection of 380 fake holders.",
      btn: "Review Case →"
    }
  },
  learn_case_pippinu: {
    meta_title: "PIPPINU Rug Pull Analysis Case Study | Taranoid",
    meta_desc: "How did a real rug pull scam happen? Step-by-step blockchain analysis and sybil wallet detection for the PIPPINU project.",
    badge: "Case Study",
    read_time: "10 min read",
    h1: "🔍 PIPPINU Rug Pull Analysis",
    intro: "380 fake wallets, 97% loss, 72 hours. Step-by-step anatomy of a real rug pull — what signals did Taranoid detect, and when?",
    summary: {
      title: "Case Summary",
      stats: [
        { label: "Taranoid Score", value: "87", sub: "/ 100 risk", color: "#F87171" },
        { label: "Real Holders", value: "~4", sub: "estimated people", color: "#FBBF24" },
        { label: "Fake Wallets", value: "376+", sub: "clustered", color: "#FB923C" },
        { label: "Loss", value: "97%", sub: "in 72 hours", color: "#EF4444" }
      ],
      note: "Note: This case is an educational analysis built from real blockchain manipulation patterns."
    },
    sections: {
      timeline: {
        title: "Chronology of Events",
        steps: [
          { time: "Hour 0 — Beginning", event: "Token Created on Pump.fun", detail: "PIPPINU token was created on Pump.fun with ~0.02 SOL cost. 80% of the total supply started gathered in 2 wallets. Initial liquidity: $1,200.", color: "#818CF8", icon: "●" },
          { time: "Hour 0–2", event: "Fake Holder Inflation — Phase 1", detail: "Small transfers between 0.001–0.003 SOL were made from the main wallet to over 200 sub-wallets. Each sub-wallet immediately bought PIPPINU. Visible holder count jumped from 12 to 240.", color: "#FBBF24", icon: "●" },
          { time: "Hour 2–6", event: "Fake Volume — Wash Trading", detail: "Cyclical trading began among 30 wallets. VLR reached 340x (liquidity $3,500, 24h volume $1.2M). Entered the 'Trending' list on DEXScreener.", color: "#FB923C", icon: "●" },
          { time: "Hour 6", event: "Social Media Campaign", detail: "'Found a 1000x gem' messages spread in Telegram channels. Coordinated posts were made by bot accounts. Real investors began buying.", color: "#F59E0B", icon: "●" },
          { time: "Hour 6–24", event: "Pump Phase — Price Peak", detail: "With real investors entering, price skyrocketed +1400% from launch. Market cap reached ~$180,000. Fake holders still held 67% of the supply.", color: "#34D399", icon: "●" },
          { time: "Hour 24–48", event: "Gradual Dump Begins", detail: "Fake wallets began selling one by one — 10–30 minutes apart to avoid detection. Price dropped slightly with each sell. Liquidity slowly drained.", color: "#F87171", icon: "●" },
          { time: "Hour 72", event: "Rug Pull Completed", detail: "All fake wallets finished selling. Developer closed the liquidity pool. Price dropped 97% from peak. Telegram channel was deleted.", color: "#EF4444", icon: "●" }
        ]
      },
      metrics: {
        title: "Taranoid Metrics — Snapshot",
        p1: "Metrics displayed when analyzed by Taranoid 2 hours after token launch:",
        table_header: "Metric Details",
        rows: [
          { label: "VLR (Volume/Liquidity)", value: "340x", sub: "Normal: <10x", color: "#F87171" },
          { label: "Holder Count", value: "247", sub: "Actual: ~4 people", color: "#F87171" },
          { label: "Cluster Score", value: "94/100", sub: "376 wallets, 2 clusters", color: "#EF4444" },
          { label: "Wash Trading", value: "78/100", sub: "Cyclical loop detected", color: "#F87171" },
          { label: "Sybil Attack", value: "91/100", sub: "Timing + funding analysis", color: "#EF4444" },
          { label: "RLS (Rug Liquidity)", value: "82/100", sub: "Unlocked liquidity", color: "#F87171" },
          { label: "Top 10 Concentration", value: "89%", sub: "Critical threshold: 60%", color: "#F87171" },
          { label: "Token Age", value: "2 hours", sub: "<24 hours: high risk", color: "#FB923C" }
        ],
        score: {
          value: "87",
          label: "Overall Risk Score",
          desc: "It was possible to see this score 4 hours before the pump phase"
        }
      },
      clustering: {
        title: "Wallet Clustering — Detailed Findings",
        p1: "Funding graph analysis revealed a 4-stage distribution network:",
        clusters: [
          { title: "Cluster 1 — Main Operator", wallets: 1, supply: "42%", desc: "The master wallet that funded the entire operation. Sent SOL to all other wallets.", color: "#EF4444" },
          { title: "Cluster 2 — Distribution Layer", wallets: 8, supply: "25%", desc: "8 intermediate wallets funded from the master wallet. These then distributed to sub-wallets.", color: "#F87171" },
          { title: "Cluster 3 — Fake Holders", wallets: 243, supply: "28%", desc: "Wallets funded from distribution wallets and used specifically to inflate holder count.", color: "#FB923C" },
          { title: "Real Holders", wallets: 124, supply: "5%", desc: "Independent users who fell for the social media campaign and actually bought the token.", color: "#34D399" }
        ],
        code: "Detected connection signals:\n• Funding: 252 wallets → funded from single source\n• Timing: 180 wallets → created in 47 minutes\n• Behavioral: 230 wallets → ±3% similar amounts\n• Graph: 2 connected components (95% of supply)"
      },
      lessons: {
        title: "5 Lessons Learned From This Case",
        items: [
          { num: "1", lesson: "Holder count is misleading", detail: "247 visible holders were actually 4 people. Look at clustering analysis, not raw numbers.", color: "#818CF8" },
          { num: "2", lesson: "VLR >50x = emergency warning", detail: "340x VLR is physically impossible. Such high ratios definitively indicate wash trading.", color: "#FBBF24" },
          { num: "3", lesson: "Gradual dump is more dangerous", detail: "Slow selling over 24 hours instead of an instant dump — requires active monitoring to notice.", color: "#FB923C" },
          { num: "4", lesson: "Trending list = caution signal", detail: "It's easy to trend with wash trading. A trending token is examined with less suspicion — an advantage for scammers.", color: "#F87171" },
          { num: "5", lesson: "Detection was possible 2 hours prior", detail: "All signals were already present 2 hours after launch. Checking before the pump saves capital.", color: "#34D399" }
        ]
      }
    },
    conclusion: {
      title: "The only defense: data-driven decisions",
      desc: "The PIPPINU example teaches us this: intuition, social media, and FOMO are inadequate. Blockchain data does not lie. Clustering, VLR, and concentration scores reveal the truth in milliseconds — if you know where to look."
    },
    cta: {
      title: "Did you spot a suspicious token?",
      desc: "See the 87-point risk in advance. Just provide the token address.",
      btn: "Analyze Token"
    },
    share: "Share this case:",
    share_telegram: "Share on Telegram",
    share_x: "Share on X"
  }
} as const
