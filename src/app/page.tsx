"use client";

import { useState, useCallback, useEffect } from "react";

// shadcn/ui components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BottomData {
  score: number;
  verdict: "BUY" | "WATCH" | "NO";
  good: string[];
  bad: string[];
  trigger: string[];
}

interface ScoresData {
  Macro: number | null;
  Trend: number | null;
  Flow: number | null;
  Bottom: number | null;
  Quality: number | null;
  Valuation: number | null;
  Tailwind: number | null;
}

interface LastData {
  Close: number | null;
  MA10: number | null;
  MA20: number | null;
  MA50: number | null;
  MA200: number | null;
  RSI: number | null;
  CMF: number | null;
  DD_252: number | null;
  Vol_Z: number | null;
  BuyPct: number | null;
  Imbalance: number | null;
  Risk_Budget: number | null;
}

interface QuantData {
  ticker: string;
  score: number;
  price: number;
  bottom: BottomData;
  scores: ScoresData;
  last: LastData;
  q_notes: string[];
  v_notes: string[];
}

interface ApiResponse {
  status: number;
  data: QuantData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// null / undefined / NaN safe — returns "—" for missing values
function fmt(n: number | null | undefined, d = 2): string {
  if (n == null || !isFinite(n)) return "—";
  return n.toFixed(d);
}

// null-safe color helpers
function scoreColor(score: number | null | undefined): string {
  if (score == null) return "#9ca3af";
  if (score >= 70) return "#16a34a";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

function scoreBg(score: number | null | undefined): string {
  if (score == null) return "rgba(156,163,175,0.08)";
  if (score >= 70) return "rgba(22,163,74,0.08)";
  if (score >= 40) return "rgba(217,119,6,0.08)";
  return "rgba(220,38,38,0.08)";
}

const verdictLabel: Record<string, string> = {
  BUY: "建议买入",
  WATCH: "持续观察",
  NO: "暂不介入",
};

const scoreLabel: Record<string, string> = {
  Macro: "宏观",
  Trend: "趋势",
  Flow: "资金流",
  Bottom: "抄底",
  Quality: "质量",
  Valuation: "估值",
  Tailwind: "催化剂",
};

function verdictScore(v: "BUY" | "WATCH" | "NO"): number {
  return v === "BUY" ? 80 : v === "WATCH" ? 55 : 20;
}

// ─── CircularScore ────────────────────────────────────────────────────────────
function CircularScore({ score }: { score: number }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "1.75rem",
          fontWeight: 700,
          color: "#0f0f0f",
          lineHeight: 1,
        }}>
          {fmt(score, 0)}
        </span>
        <span style={{
          fontSize: "0.62rem",
          color: "#9ca3af",
          marginTop: 3,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: "0.04em",
        }}>
          / 100
        </span>
      </div>
    </div>
  );
}

// ─── ScoreBar — shadcn Progress ───────────────────────────────────────────────
// Bug fix: setTimeout moved into useEffect with proper cleanup.
// Bug fix: score typed as number | null; null renders "N/A" with grey bar.
function ScoreBar({ label, score, delay = 0 }: { label: string; score: number | null; delay?: number }) {
  const [value, setValue] = useState(0);
  const color = scoreColor(score);

  useEffect(() => {
    if (score == null) return;
    const t = setTimeout(() => setValue(score), 150 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  const displayScore = score == null ? "N/A" : fmt(score, 1);
  const barWidth = score == null ? 0 : value;

  return (
    <div style={{ marginBottom: 15 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
        <span style={{ fontSize: "0.8rem", color: "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {label}
          <span style={{ color: "#9ca3af", marginLeft: 7, fontSize: "0.72rem" }}>{scoreLabel[label]}</span>
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.78rem",
          fontWeight: 600,
          color,
        }}>
          {displayScore}
        </span>
      </div>
      {/*
        shadcn Progress: override indicator color via CSS variable --progress-color.
        The global style below applies it to [role="progressbar"] > div.
      */}
      <Progress
        value={barWidth}
        className="h-[4px]"
        style={{ background: "#f3f4f6", "--progress-color": color } as React.CSSProperties}
      />
    </div>
  );
}

// ─── LoadingSkeleton — shadcn Skeleton ────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Skeleton className="w-full rounded-xl" style={{ height: 96 }} />
      <Skeleton className="w-full rounded-xl" style={{ height: 190 }} />
      <Skeleton className="w-full rounded-xl" style={{ height: 140 }} />
      <Skeleton className="w-full rounded-xl" style={{ height: 160 }} />
    </div>
  );
}

// ─── VerdictBadge — shadcn Badge ──────────────────────────────────────────────
function VerdictBadge({ verdict }: { verdict: "BUY" | "WATCH" | "NO" }) {
  const s = verdictScore(verdict);
  return (
    <Badge
      variant="outline"
      style={{
        background: scoreBg(s),
        color: scoreColor(s),
        borderColor: "transparent",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.07em",
        padding: "2px 9px",
        borderRadius: 6,
        lineHeight: 1.4,
      }}
    >
      {verdict}
    </Badge>
  );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────
function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: "#fafafa",
      borderRadius: 8,
      padding: "12px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      <span style={{
        fontSize: "0.62rem",
        color: "#9ca3af",
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.92rem",
        fontWeight: 600,
        color: "#0f0f0f",
      }}>
        {value}
      </span>
    </div>
  );
}

// ─── Small layout helpers ─────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "0.65rem",
      color: "#9ca3af",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      marginBottom: 18,
      fontWeight: 600,
    }}>
      {children}
    </p>
  );
}

function HR() {
  return <div style={{ height: 1, background: "#f3f4f6", margin: "16px 0" }} />;
}

// Shared card wrapper props
const cardStyle: React.CSSProperties = { padding: "22px 24px" };

function StyledCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Card
      className="mb-3 border-[#e5e7eb] shadow-none"
      style={{
        animation: "fadeUp 0.4s ease both",
        animationDelay: `${delay}ms`,
        borderRadius: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <CardContent style={cardStyle}>{children}</CardContent>
    </Card>
  );
}

// ─── ResultPanel ──────────────────────────────────────────────────────────────
function ResultPanel({ data }: { data: QuantData }) {
  return (
    <>
      {/* ── Module 1: Score Overview ── */}
      <StyledCard delay={0}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
              <span style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "2.1rem",
                fontWeight: 400,
                color: "#0f0f0f",
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}>
                {data.ticker}
              </span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "1.05rem",
                color: "#9ca3af",
              }}>
                {fmt(data.price)}
              </span>
            </div>
            <p style={{
              fontSize: "0.72rem",
              color: "#9ca3af",
              marginBottom: 16,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              综合量化评分
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <VerdictBadge verdict={data.bottom.verdict} />
              <span style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {verdictLabel[data.bottom.verdict]}
              </span>
            </div>
          </div>
          <CircularScore score={data.score} />
        </div>
      </StyledCard>

      {/* ── Module 2: Dimension Scores ── */}
      <StyledCard delay={60}>
        <SectionLabel>各维度评分</SectionLabel>
        {Object.entries(data.scores).map(([key, val], i) => (
          <ScoreBar key={key} label={key} score={val} delay={i * 55} />
        ))}
      </StyledCard>

      {/* ── Module 3: Bottom Detector ── */}
      <StyledCard delay={120}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <SectionLabel>抄底判定器</SectionLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.88rem",
              fontWeight: 600,
              color: scoreColor(data.bottom.score),
            }}>
              {data.bottom.score}
              <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "0.7rem" }}>/100</span>
            </span>
            <VerdictBadge verdict={data.bottom.verdict} />
          </div>
        </div>

        {data.bottom.good.length > 0 && (
          <div style={{ marginBottom: 4 }}>
            <p style={{ fontSize: "0.67rem", color: "#9ca3af", marginBottom: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.04em" }}>
              已满足条件
            </p>
            {data.bottom.good.map((g, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.78rem", flexShrink: 0, lineHeight: "1.5" }}>✅</span>
                <span style={{ fontSize: "0.82rem", color: "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.55 }}>{g}</span>
              </div>
            ))}
          </div>
        )}

        {data.bottom.bad.length > 0 && (
          <>
            {data.bottom.good.length > 0 && <HR />}
            <div>
              <p style={{ fontSize: "0.67rem", color: "#9ca3af", marginBottom: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.04em" }}>
                风险 / 不足
              </p>
              {data.bottom.bad.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: "0.78rem", flexShrink: 0, lineHeight: "1.5" }}>⚠️</span>
                  <span style={{ fontSize: "0.82rem", color: "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.55 }}>{b}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {data.bottom.trigger.length > 0 && (
          <>
            <HR />
            <div>
              <p style={{ fontSize: "0.67rem", color: "#9ca3af", marginBottom: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.04em" }}>
                触发条件
              </p>
              {data.bottom.trigger.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: "0.78rem", flexShrink: 0, lineHeight: "1.5" }}>🔔</span>
                  <span style={{ fontSize: "0.82rem", color: "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.55 }}>{t}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </StyledCard>

      {/* ── Module 4: Technical Indicators ── */}
      <StyledCard delay={180}>
        <SectionLabel>关键技术指标</SectionLabel>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))",
          gap: 8,
        }}>
          <MetricCard label="收盘价" value={fmt(data.last.Close)} />
          <MetricCard label="MA10" value={fmt(data.last.MA10)} />
          <MetricCard label="MA20" value={fmt(data.last.MA20)} />
          <MetricCard label="MA50" value={fmt(data.last.MA50)} />
          <MetricCard label="MA200" value={fmt(data.last.MA200)} />
          <MetricCard label="RSI" value={fmt(data.last.RSI)} />
          <MetricCard label="CMF" value={fmt(data.last.CMF, 4)} />
          {/* DD_252 needs its own null guard since it requires multiplication */}
          <MetricCard
            label="年内回撤"
            value={data.last.DD_252 != null ? `${(data.last.DD_252 * 100).toFixed(1)}%` : "—"}
          />
          <MetricCard label="买入占比" value={data.last.BuyPct != null ? `${fmt(data.last.BuyPct)}%` : "—"} />
          <MetricCard label="风险预算" value={fmt(data.last.Risk_Budget, 2)} />
        </div>
      </StyledCard>

      {/* ── Module 5: Fundamentals ── */}
      <StyledCard delay={240}>
        <SectionLabel>基本面注释</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
          <div>
            <p style={{ fontSize: "0.67rem", color: "#9ca3af", marginBottom: 12, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.04em" }}>
              质量指标
            </p>
            {data.q_notes.map((n, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#16a34a", flexShrink: 0 }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.73rem", color: "#374151" }}>{n}</span>
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontSize: "0.67rem", color: "#9ca3af", marginBottom: 12, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.04em" }}>
              估值指标
            </p>
            {data.v_notes.map((n, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#d97706", flexShrink: 0 }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.73rem", color: "#374151" }}>{n}</span>
              </div>
            ))}
          </div>
        </div>
      </StyledCard>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState<QuantData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const search = useCallback(async (t: string) => {
    const sym = t.trim().toUpperCase();
    if (!sym) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(
        `https://patient-tree-3ef6.leigoti3.workers.dev/api/quant/analyze?ticker=${sym}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse = await res.json();
      if (json.status !== 0) throw new Error("接口返回异常");
      setData(json.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "请求失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /*
          Override shadcn Progress indicator color.
          shadcn renders: <div role="progressbar"><div class="bg-primary" /></div>
          We set --progress-color on the outer element and apply it to the inner fill.
        */
        [role="progressbar"] > div {
          background-color: var(--progress-color, #9ca3af) !important;
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        button:hover:not(:disabled) {
          background: #1a1a1a !important;
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{ borderBottom: "1px solid #f3f4f6" }}>
        <div style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "0 24px",
          height: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7, background: "#0f0f0f",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1.5 10 L4 6 L6.5 7.8 L9 3.5 L11.5 5.5"
                  stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "1.1rem",
              color: "#0f0f0f",
              letterSpacing: "-0.01em",
            }}>
              Qianting
            </span>
          </div>
          <a
            href="#"
            style={{ color: "#9ca3af", display: "flex", alignItems: "center", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "44px 24px 80px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "1.85rem",
            fontWeight: 400,
            color: "#0f0f0f",
            letterSpacing: "-0.02em",
            marginBottom: 8,
            lineHeight: 1.2,
          }}>
            股票量化分析
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#9ca3af", lineHeight: 1.5 }}>
            输入股票代码，即刻获取多维量化评分报告
          </p>
        </div>

        {/* Search bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: "flex",
            gap: 8,
            border: `1.5px solid ${focused ? "#0f0f0f" : "#e5e7eb"}`,
            borderRadius: 10,
            padding: "5px 5px 5px 16px",
            background: "#fff",
            boxShadow: focused ? "0 0 0 3px rgba(15,15,15,0.05)" : "0 1px 3px rgba(0,0,0,0.04)",
            transition: "border-color 0.15s, box-shadow 0.15s",
            alignItems: "center",
          }}>
            <input
              type="text"
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && search(ticker)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="输入股票代码，如 AAPL"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "0.9rem",
                color: "#0f0f0f",
                background: "transparent",
                letterSpacing: "0.05em",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
            <button
              onClick={() => search(ticker)}
              disabled={loading || !ticker.trim()}
              style={{
                padding: "9px 20px",
                borderRadius: 7,
                border: "none",
                background: loading || !ticker.trim() ? "#f3f4f6" : "#0f0f0f",
                color: loading || !ticker.trim() ? "#9ca3af" : "#fff",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: loading || !ticker.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "background 0.15s",
                whiteSpace: "nowrap",
                letterSpacing: "0.01em",
              }}
            >
              {loading ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
                    style={{ animation: "spin 0.7s linear infinite" }}>
                    <circle cx="6.5" cy="6.5" r="5" stroke="#d1d5db" strokeWidth="2" />
                    <path d="M6.5 1.5 A5 5 0 0 1 11.5 6.5" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  分析中
                </>
              ) : "开始分析"}
            </button>
          </div>

          {error && (
            <p style={{
              marginTop: 8,
              fontSize: "0.77rem",
              color: "#dc2626",
              paddingLeft: 4,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              ⚠ {error}
            </p>
          )}
        </div>

        {/* Results */}
        {loading && <LoadingSkeleton />}
        {!loading && data && <ResultPanel data={data} />}
        {!loading && !data && !error && (
          <div style={{ textAlign: "center", paddingTop: 56 }}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none"
              style={{ margin: "0 auto 12px", display: "block" }}>
              <rect width="44" height="44" rx="11" fill="#f9fafb" />
              <path d="M10 32 L16 22 L22 26 L28 16 L34 19"
                stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ fontSize: "0.78rem", color: "#d1d5db", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              输入股票代码查看量化分析报告
            </p>
          </div>
        )}
      </main>
    </>
  );
}
