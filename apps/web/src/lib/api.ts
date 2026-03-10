/**
 * Taranoid — API İstemcisi (Sprint 2)
 * Backend Pydantic modelleriyle birebir uyumlu tip tanımları.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://web-production-b704c.up.railway.app";

export interface TokenInfo {
    address: string;
    name: string | null;
    symbol: string | null;
    supply: number | null;
    decimals: number | null;
    creator_wallet: string | null;
    platform: string | null;
    chain: string;
    created_at: string | null;
}

export interface VLRMetric {
    value: number;
    score: number;
    label_tr: string;
    volume_24h: number;
    liquidity: number;
}

export interface RLSMetric {
    value: number;
    score: number;
    label_tr: string;
    mcap: number;
    real_exit_value: number;
}

export interface HolderMetric {
    count: number;
    active_1h: number;
    active_ratio: number;
    top10_concentration: number;
    score: number;
    label_tr: string;
}

// Sprint 2 — Backend models.py ile birebir uyumlu
export interface ClusterMetric {
    cluster_count: number;
    total_wallets: number;
    largest_pct: number;
    score: number;
    label_tr: string;
}

export interface WashMetric {
    cycles_found: number;
    cycle_volume_usd: number;
    fake_volume_pct: number;
    score: number;
    label_tr: string;
}

export interface SybilMetric {
    young_wallet_pct: number;
    single_token_pct: number;
    score: number;
    label_tr: string;
}

export interface BundlerMetric {
    detected: boolean;
    bundle_count: number;
    max_recipients: number;
    score: number;
    label_tr: string;
}

export interface ExitMetric {
    detected: boolean;
    stages: number;
    seller_is_creator: boolean;
    score: number;
    label_tr: string;
}

export interface CurveMetric {
    platform: string;
    graduation_time_min: number;
    score: number;
    label_tr: string;
}

export interface CreatorMetric {
    creator_wallet: string;
    total_tokens: number;
    rug_count: number;
    rug_ratio: number;
    score: number;
    label_tr: string;
    known: boolean;
}

export interface ScoreResult {
    total: number;
    level: string;
    label_tr: string;
    label_en: string;
    color: string;
}

export interface TokenAnalysis {
    token: TokenInfo;
    score: ScoreResult;
    metrics: {
        vlr: VLRMetric;
        rls: RLSMetric;
        holders: HolderMetric;
        // Sprint 2 — MetricsResultV2'den geliyor, her zaman var
        cluster: ClusterMetric;
        wash: WashMetric;
        sybil: SybilMetric;
        bundler: BundlerMetric;
        exit: ExitMetric;
        curve: CurveMetric;
        creator: CreatorMetric;
    };
    warnings_tr: string[];
    report_tr: string;
    cached: boolean;
    analyzed_at: string;
}

export interface ClusterDetail {
    cluster_id: string;
    wallet_count: number;
    pct_supply: number;
    root_wallet: string;
    avg_wallet_age_hrs: number;
    behavioral_similarity: number;
    funding_source_count: number;
    wallets: string[];
}

export interface ClustersData {
    token_address: string;
    cluster_count: number;
    total_wallets: number;
    clusters: ClusterDetail[];
}

export interface HolderData {
    token_address: string;
    holder_count: number;
    holders: Array<{
        address: string;
        balance: number;
        ui_amount: number;
        pct_supply?: number;
    }>;
}

export interface HealthStatus {
    status: string;
    version: string;
    scoring: string;
    metrics_count: number;
    services: {
        api: boolean;
        redis: boolean;
        postgresql: boolean;
    };
}

class TaranoidAPI {
    private baseUrl: string;

    constructor(baseUrl: string = API_URL) {
        this.baseUrl = baseUrl;
    }

    async analyzeToken(address: string): Promise<TokenAnalysis> {
        const res = await fetch(`${this.baseUrl}/api/v1/token/${address}`, {
            cache: "no-store",
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new APIError(
                res.status,
                err.detail || "Token analizi başarısız oldu."
            );
        }

        return res.json();
    }

    async getHolders(address: string): Promise<HolderData> {
        const res = await fetch(
            `${this.baseUrl}/api/v1/token/${address}/holders`,
            { cache: "no-store" }
        );

        if (!res.ok) {
            throw new APIError(res.status, "Holder verisi çekilemedi.");
        }

        return res.json();
    }

    async getTrending(): Promise<{ tokens: TokenAnalysis[] }> {
        const res = await fetch(`${this.baseUrl}/api/v1/trending/risky`, {
            next: { revalidate: 300 },
        });

        if (!res.ok) {
            throw new APIError(res.status, "Trend verisi çekilemedi.");
        }

        return res.json();
    }

    async getClusters(address: string): Promise<ClustersData | null> {
        try {
            const res = await fetch(
                `${this.baseUrl}/api/v1/token/${address}/clusters`,
                { cache: "no-store" }
            );
            if (!res.ok) return null;
            return res.json();
        } catch {
            return null;
        }
    }

    async getHistory(address: string): Promise<{ history: any[] }> {
        const res = await fetch(
            `${this.baseUrl}/api/v1/token/${address}/history`,
            { cache: "no-store" }
        );

        if (!res.ok) {
            throw new APIError(res.status, "Geçmiş verisi çekilemedi.");
        }

        return res.json();
    }

    async healthCheck(): Promise<HealthStatus> {
        const res = await fetch(`${this.baseUrl}/api/v1/health`);
        return res.json();
    }
}

export class APIError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.name = "APIError";
    }
}

export const api = new TaranoidAPI();
export default api;
