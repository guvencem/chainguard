/**
 * ChainGuard — API İstemcisi (Sprint 2)
 * 9 metrikli skorlama sistemi ile uyumlu tip tanımları.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface TokenInfo {
    address: string;
    name: string | null;
    symbol: string | null;
    supply: number | null;
    decimals: number | null;
    creator_wallet: string | null;
    platform: string | null;
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

// Sprint 2 — Yeni Metrik Tipleri
export interface ClusterMetric {
    score: number;
    label_tr: string;
    cluster_count: number;
    largest_pct: number;
    total_wallets: number;
}

export interface WashMetric {
    score: number;
    label_tr: string;
    cycles_found: number;
    wash_volume_pct: number;
    same_amount_pairs: number;
}

export interface SybilMetric {
    score: number;
    label_tr: string;
    young_wallet_pct: number;
    single_token_pct: number;
    similar_balance_pct: number;
}

export interface BundlerMetric {
    score: number;
    label_tr: string;
    detected: boolean;
    bundle_count: number;
    max_recipients: number;
}

export interface ExitMetric {
    score: number;
    label_tr: string;
    stages_detected: number;
    total_exit_pct: number;
}

export interface CurveMetric {
    score: number;
    label_tr: string;
    pump_speed_minutes: number;
    insider_pct: number;
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
        // Sprint 2
        cluster?: ClusterMetric;
        wash?: WashMetric;
        sybil?: SybilMetric;
        bundler?: BundlerMetric;
        exit?: ExitMetric;
        curve?: CurveMetric;
    };
    warnings_tr: string[];
    cached: boolean;
    analyzed_at: string;
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

class ChainGuardAPI {
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

export const api = new ChainGuardAPI();
export default api;
