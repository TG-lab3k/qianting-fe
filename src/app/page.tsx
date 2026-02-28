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

// ─── Tape Types ───────────────────────────────────────────────────────────────
interface TapeDayRow {
  Date?: string | null;
  Close?: number | null;
  "Ret%"?: number | null;
  "Buy%"?: number | null;
  VolZ?: number | null;
  RangeQ?: number | null;
  CMF?: number | null;
  Imbalance?: number | null;
  BlockProxy?: string | null;
}

interface BlockRow {
  Date?: string | null;
  Close?: number | null;
  "Ret%"?: number | null;
  Vol_Z?: number | null;
  Range_Q?: number | null;
  CMF?: number | null;
  Imbalance?: number | null;
  BlockProxy?: string | null;
}

interface MonthlyRow {
  Month?: string | null;
  BuyPct_Month?: number | null;
  AvgVolZ?: number | null;
  AvgCMF?: number | null;
  UpDays?: number | null;
  Days?: number | null;
}

interface TapeData {
  top_buy?: TapeDayRow[];
  top_sell?: TapeDayRow[];
  monthly?: MonthlyRow[];
  blocks?: BlockRow[];
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
  tape?: TapeData;
}

interface ApiResponse {
  status: number;
  data: QuantData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** null / undefined / NaN → "--" */
function fmt(n: number | null | undefined, d = 2): string {
  if (n == null || !isFinite(n)) return "--";
  return n.toFixed(d);
}

/** percentage with null guard */
function fmtPct(n: number | null | undefined, d = 1): string {
  if (n == null || !isFinite(n)) return "--";
  return n.toFixed(d) + "%";
}

/** null/NaN-safe validity check */
function isValid(n: number | null | undefined): n is number {
  return n != null && isFinite(n);
}

function scoreColor(score: number | null | undefined): string {
  if (!isValid(score)) return "#9ca3af";
  if (score >= 70) return "#16a34a";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

function scoreBg(score: number | null | undefined): string {
  if (!isValid(score)) return "rgba(156,163,175,0.08)";
  if (score >= 70) return "rgba(22,163,74,0.08)";
  if (score >= 40) return "rgba(217,119,6,0.08)";
  return "rgba(220,38,38,0.08)";
}

/** positive = green, negative = red */
function signColor(n: number | null | undefined): string {
  if (!isValid(n)) return "#9ca3af";
  return n >= 0 ? "#16a34a" : "#dc2626";
}

/** Buy% coloring: ≥70 green, ≥50 amber, <50 red */
function buyPctColor(n: number | null | undefined): string {
  if (!isValid(n)) return "#9ca3af";
  if (n >= 70) return "#16a34a";
  if (n >= 50) return "#d97706";
  return "#dc2626";
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
  Tailwind: "行业顺风/景气度",
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
function ScoreBar({ label, score, delay = 0 }: { label: string; score: number | null; delay?: number }) {
  const [value, setValue] = useState(0);
  const color = scoreColor(score);

  useEffect(() => {
    if (!isValid(score)) return;
    const t = setTimeout(() => setValue(score), 150 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  const displayScore = isValid(score) ? fmt(score, 1) : "--";
  const barWidth = isValid(score) ? value : 0;

  return (
    <div style={{ marginBottom: 15 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
        <span style={{ fontSize: "0.8rem", color: "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {label}
          <span style={{ color: "#9ca3af", marginLeft: 7, fontSize: "0.72rem" }}>{scoreLabel[label]}</span>
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", fontWeight: 600, color }}>
          {displayScore}
        </span>
      </div>
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
      <Skeleton className="w-full rounded-xl" style={{ height: 300 }} />
      <Skeleton className="w-full rounded-xl" style={{ height: 80 }} />
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

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "0.67rem",
      color: "#9ca3af",
      marginBottom: 10,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      letterSpacing: "0.04em",
    }}>
      {children}
    </p>
  );
}

function HR() {
  return <div style={{ height: 1, background: "#f3f4f6", margin: "16px 0" }} />;
}

const cardStyle: React.CSSProperties = { padding: "22px 24px" };

function StyledCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
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

// ─── Tape shared styles ───────────────────────────────────────────────────────
const monoCell: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "0.7rem",
  textAlign: "right",
  whiteSpace: "nowrap",
};
const dateCell: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "0.68rem",
  textAlign: "left",
  whiteSpace: "nowrap",
  color: "#374151",
};
const thBase: React.CSSProperties = {
  fontSize: "0.58rem",
  color: "#9ca3af",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  paddingBottom: 6,
  borderBottom: "1px solid #f3f4f6",
  whiteSpace: "nowrap",
};

/** BlockProxy colored tag */
function BlockTag({ bp }: { bp?: string | null }) {
  if (!bp || bp.trim() === "") return <span style={{ ...monoCell, color: "#d1d5db" }}>--</span>;
  const isDistrib = bp.includes("DISTRIB");
  const isAbsorb = bp.includes("ABSORB");
  const color = isDistrib ? "#dc2626" : isAbsorb ? "#16a34a" : "#d97706";
  const bg = isDistrib ? "rgba(220,38,38,0.08)" : isAbsorb ? "rgba(22,163,74,0.08)" : "rgba(217,119,6,0.08)";
  return (
    <span style={{
      fontSize: "0.62rem",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color, background: bg,
      borderRadius: 4,
      padding: "1px 5px",
      whiteSpace: "nowrap",
    }}>
      {bp}
    </span>
  );
}

// ─── Module 6: Flow Tape ──────────────────────────────────────────────────────
function FlowTapeModule({ tape }: { tape: TapeData }) {
  const topBuy  = tape.top_buy  ?? [];
  const topSell = tape.top_sell ?? [];
  const monthly = tape.monthly  ?? [];
  const blocks  = tape.blocks   ?? [];

  // grid column templates
  const dayCols   = "88px 58px 54px 54px 50px 54px 54px 60px";
  const monthCols = "70px 58px 56px 62px 58px";
  const blockCols = "88px 58px 54px 50px 54px 54px 60px 1fr";

  const DAY_HEADERS   = ["日期", "收盘", "Ret%", "Buy%", "VolZ", "RangeQ", "CMF", "失衡"];
  const MONTH_HEADERS = ["月份", "Buy%", "AvgVolZ", "AvgCMF", "上涨/总"];
  const BLOCK_HEADERS = ["日期", "收盘", "Ret%", "VolZ", "RangeQ", "CMF", "失衡", "判断"];

  function TableHeader({ cols, template, leftIdx }: { cols: string[]; template: string; leftIdx?: number[] }) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: template, gap: "0 4px", marginBottom: 2 }}>
        {cols.map((h, i) => (
          <span key={h} style={{ ...thBase, textAlign: (leftIdx ?? [0]).includes(i) ? "left" : "right" }}>{h}</span>
        ))}
      </div>
    );
  }

  function DayRow({ row }: { row: TapeDayRow }) {
    const hasBp = !!(row.BlockProxy?.trim());
    return (
      <div style={{ display: "grid", gridTemplateColumns: dayCols, gap: "0 4px", padding: "4px 0", borderBottom: "1px solid #fafafa", alignItems: "center" }}>
        <span style={dateCell}>{row.Date ?? "--"}</span>
        <span style={{ ...monoCell, color: "#0f0f0f" }}>{fmt(row.Close)}</span>
        <span style={{ ...monoCell, color: signColor(row["Ret%"]) }}>{fmtPct(row["Ret%"])}</span>
        <span style={{ ...monoCell, color: buyPctColor(row["Buy%"]) }}>{fmtPct(row["Buy%"])}</span>
        <span style={{ ...monoCell, color: "#374151" }}>{fmt(row.VolZ, 3)}</span>
        <span style={{ ...monoCell, color: "#374151" }}>{fmt(row.RangeQ, 3)}</span>
        <span style={{ ...monoCell, color: signColor(row.CMF) }}>{fmt(row.CMF, 3)}</span>
        <span style={{ ...monoCell, color: signColor(row.Imbalance), fontWeight: hasBp ? 700 : 400 }}>
          {fmt(row.Imbalance, 3)}
          {hasBp && (
            <span style={{ marginLeft: 3, fontSize: "0.55rem", background: "rgba(220,38,38,0.1)", color: "#dc2626", borderRadius: 3, padding: "0 3px" }}>!</span>
          )}
        </span>
      </div>
    );
  }

  const hasAny = topBuy.length > 0 || topSell.length > 0 || monthly.length > 0 || blocks.length > 0;

  if (!hasAny) {
    return <p style={{ fontSize: "0.75rem", color: "#d1d5db", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>暂无 Flow Tape 数据</p>;
  }

  return (
    <>
      {/* 9.1 Top Buy Days */}
      {topBuy.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          <SubLabel>9.1  最近 ~6个月 Top 买盘日（BuyProxyVol 最大）</SubLabel>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 540 }}>
              <TableHeader cols={DAY_HEADERS} template={dayCols} leftIdx={[0]} />
              {topBuy.map((row, i) => <DayRow key={i} row={row} />)}
            </div>
          </div>
        </div>
      )}

      {/* 9.2 Top Sell Days */}
      {topSell.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          <HR />
          <SubLabel>9.2  最近 ~6个月 Top 卖压日（SellProxyVol 最大）</SubLabel>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 540 }}>
              <TableHeader cols={DAY_HEADERS} template={dayCols} leftIdx={[0]} />
              {topSell.map((row, i) => <DayRow key={i} row={row} />)}
            </div>
          </div>
        </div>
      )}

      {/* 9.3 Monthly */}
      {monthly.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          <HR />
          <SubLabel>9.3  按月汇总（买盘代理 vs 卖盘代理）</SubLabel>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 340 }}>
              <TableHeader cols={MONTH_HEADERS} template={monthCols} leftIdx={[0]} />
              {monthly.map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: monthCols, gap: "0 4px", padding: "4px 0", borderBottom: "1px solid #fafafa", alignItems: "center" }}>
                  <span style={dateCell}>{row.Month ?? "--"}</span>
                  <span style={{ ...monoCell, color: buyPctColor(row.BuyPct_Month) }}>{fmtPct(row.BuyPct_Month)}</span>
                  <span style={{ ...monoCell, color: "#374151" }}>{fmt(row.AvgVolZ, 3)}</span>
                  <span style={{ ...monoCell, color: signColor(row.AvgCMF) }}>{fmt(row.AvgCMF, 4)}</span>
                  <span style={{ ...monoCell, color: "#374151" }}>{row.UpDays ?? "--"}/{row.Days ?? "--"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9.4 Block / 隐埋大单 */}
      {blocks.length > 0 && (
        <div>
          <HR />
          <SubLabel>9.4  "隐埋大单 / 大额异动"代理日（异常放量 + 窄幅波动）</SubLabel>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 540 }}>
              <TableHeader cols={BLOCK_HEADERS} template={blockCols} leftIdx={[0, 7]} />
              {blocks.map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: blockCols, gap: "0 4px", padding: "4px 0", borderBottom: "1px solid #fafafa", alignItems: "center" }}>
                  <span style={dateCell}>{row.Date ?? "--"}</span>
                  <span style={{ ...monoCell, color: "#0f0f0f" }}>{fmt(row.Close)}</span>
                  <span style={{ ...monoCell, color: signColor(row["Ret%"]) }}>{fmtPct(row["Ret%"])}</span>
                  <span style={{ ...monoCell, color: "#374151" }}>{fmt(row.Vol_Z, 3)}</span>
                  <span style={{ ...monoCell, color: "#374151" }}>{fmt(row.Range_Q, 3)}</span>
                  <span style={{ ...monoCell, color: signColor(row.CMF) }}>{fmt(row.CMF, 3)}</span>
                  <span style={{ ...monoCell, color: signColor(row.Imbalance) }}>{fmt(row.Imbalance, 3)}</span>
                  <BlockTag bp={row.BlockProxy} />
                </div>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
            {[
              { dot: "#16a34a", text: "ABSORB?：偏吸筹嫌疑（放量但不大跌 / 资金不弱）" },
              { dot: "#dc2626", text: "DISTRIB?：偏派发嫌疑（放量但不大涨 / 资金偏弱）" },
            ].map(({ dot, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                <span style={{ fontSize: "0.65rem", color: "#6b7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Module 7: Objective Summary ─────────────────────────────────────────────
// Logic mirrors Python QuantCoreResearchPro print_flow_tape section 10
function ObjectiveSummary({ data }: { data: QuantData }) {
  const { scores, score: overall, bottom } = data;
  const trendS = scores.Trend;
  const flowS  = scores.Flow;
  const valS   = scores.Valuation;
  const twS    = scores.Tailwind;

  // ── stance ──
  let stance: string;
  if (isValid(trendS) && isValid(flowS)) {
    if (trendS >= 65 && flowS >= 60) {
      stance = "多头结构占优（趋势 + 资金同步偏强）";
    } else if (trendS <= 35 && flowS <= 40) {
      stance = "空头结构占优（趋势 + 资金同步偏弱）";
    } else {
      stance = "多空拉锯（结构未统一，关注关键价位与资金确认）";
    }
  } else {
    stance = "中性 / 数据不足";
  }

  // ── narrative ──
  let narrative = "";
  if (isValid(twS) && isValid(valS)) {
    if (twS < 40 && valS < 40) {
      narrative = "行业逆风 + 估值不便宜，反弹更依赖确认而非主观抄底";
    } else if (twS < 40 && valS > 60) {
      narrative = "行业逆风但估值偏便宜，若出现资金回流更像“错杀修复”";
    } else if (twS > 60) {
      narrative = "行业顺风期，趋势延续概率更高";
    }
  }

  const overallStr = isValid(overall) ? overall.toFixed(0) : "--";
  const verdict = bottom.verdict;
  const verdictColorMap: Record<string, string> = { BUY: "#16a34a", WATCH: "#d97706", NO: "#dc2626" };
  const vColor = verdictColorMap[verdict] ?? "#9ca3af";

  return (
    <div style={{ background: "#fafafa", borderRadius: 10, padding: "18px 20px" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* accent bar */}
        <div style={{ width: 3, minHeight: 44, borderRadius: 2, background: vColor, flexShrink: 0, alignSelf: "stretch" }} />

        <div style={{ flex: 1 }}>
          {/* stance */}
          <p style={{
            fontSize: "0.84rem",
            color: "#0f0f0f",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 600,
            lineHeight: 1.5,
            marginBottom: 10,
          }}>
            {stance}
          </p>

          {/* tags */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5px 8px" }}>
            <span style={{ fontSize: "0.67rem", color: "#9ca3af", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Bottom</span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.69rem",
              fontWeight: 700,
              color: vColor,
              background: vColor + "18",
              padding: "1px 8px",
              borderRadius: 5,
            }}>
              {verdict}
            </span>
            <span style={{ fontSize: "0.67rem", color: "#9ca3af", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>综合评分</span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.69rem",
              fontWeight: 700,
              color: scoreColor(overall),
            }}>
              {overallStr}
            </span>

            {/* dimension pills */}
            {(["Trend", "Flow", "Tailwind", "Valuation"] as const).map(k => {
              const v = scores[k];
              if (!isValid(v)) return null;
              return (
                <span key={k} style={{
                  fontSize: "0.63rem",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: scoreColor(v),
                  background: scoreBg(v),
                  padding: "1px 6px",
                  borderRadius: 4,
                }}>
                  {scoreLabel[k]} {v.toFixed(0)}
                </span>
              );
            })}
          </div>

          {/* narrative */}
          {narrative && (
            <p style={{
              marginTop: 12,
              fontSize: "0.77rem",
              color: "#6b7280",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              lineHeight: 1.6,
              borderLeft: "2px solid #e5e7eb",
              paddingLeft: 10,
            }}>
              {narrative}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ResultPanel ──────────────────────────────────────────────────────────────
function ResultPanel({ data }: { data: QuantData }) {
  return (
    <>
      {/* ── Module 1: Score Overview ── */}
      <StyledCard delay={0}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
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
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.05rem", color: "#9ca3af" }}>
                {fmt(data.price)}
              </span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginBottom: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              综合量化评分
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <VerdictBadge verdict={data.bottom.verdict} />
              <span style={{ fontSize: "0.75rem", color: "#6b7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.88rem", fontWeight: 600, color: scoreColor(data.bottom.score) }}>
              {data.bottom.score}
              <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "0.7rem" }}>/100</span>
            </span>
            <VerdictBadge verdict={data.bottom.verdict} />
          </div>
        </div>

        {data.bottom.good.length > 0 && (
          <div style={{ marginBottom: 4 }}>
            <SubLabel>已满足条件</SubLabel>
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
            <SubLabel>风险 / 不足</SubLabel>
            {data.bottom.bad.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.78rem", flexShrink: 0, lineHeight: "1.5" }}>⚠️</span>
                <span style={{ fontSize: "0.82rem", color: "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.55 }}>{b}</span>
              </div>
            ))}
          </>
        )}
        {data.bottom.trigger.length > 0 && (
          <>
            <HR />
            <SubLabel>触发条件</SubLabel>
            {data.bottom.trigger.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.78rem", flexShrink: 0, lineHeight: "1.5" }}>🔔</span>
                <span style={{ fontSize: "0.82rem", color: "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.55 }}>{t}</span>
              </div>
            ))}
          </>
        )}
      </StyledCard>

      {/* ── Module 4: Technical Indicators ── */}
      <StyledCard delay={180}>
        <SectionLabel>关键技术指标</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))", gap: 8 }}>
          <MetricCard label="收盘价" value={fmt(data.last.Close)} />
          <MetricCard label="MA10" value={fmt(data.last.MA10)} />
          <MetricCard label="MA20" value={fmt(data.last.MA20)} />
          <MetricCard label="MA50" value={fmt(data.last.MA50)} />
          <MetricCard label="MA200" value={fmt(data.last.MA200)} />
          <MetricCard label="RSI" value={fmt(data.last.RSI)} />
          <MetricCard label="CMF" value={fmt(data.last.CMF, 4)} />
          <MetricCard label="年内回撤" value={isValid(data.last.DD_252) ? `${(data.last.DD_252 * 100).toFixed(1)}%` : "--"} />
          <MetricCard label="买入占比" value={isValid(data.last.BuyPct) ? `${fmt(data.last.BuyPct)}%` : "--"} />
          <MetricCard label="风险预算" value={fmt(data.last.Risk_Budget, 2)} />
        </div>
      </StyledCard>

      {/* ── Module 5: Fundamentals ── */}
      <StyledCard delay={240}>
        <SectionLabel>基本面注释</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
          <div>
            <SubLabel>质量指标</SubLabel>
            {data.q_notes.map((n, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#16a34a", flexShrink: 0 }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.73rem", color: "#374151" }}>{n}</span>
              </div>
            ))}
          </div>
          <div>
            <SubLabel>估值指标</SubLabel>
            {data.v_notes.map((n, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#d97706", flexShrink: 0 }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.73rem", color: "#374151" }}>{n}</span>
              </div>
            ))}
          </div>
        </div>
      </StyledCard>

      {/* ── Module 6: Flow Tape ── */}
      {data.tape && (
        <StyledCard delay={300}>
          <SectionLabel>Flow Tape · 资金流向明细</SectionLabel>
          <p style={{
            fontSize: "0.67rem",
            color: "#9ca3af",
            marginBottom: 18,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            lineHeight: 1.6,
          }}>
            以下不是「真实多空成交」，而是日线买卖压力代理，可复现 / 可验证
          </p>
          <FlowTapeModule tape={data.tape} />
        </StyledCard>
      )}

      {/* ── Module 7: Objective Summary ── */}
      <StyledCard delay={360}>
        <SectionLabel>一句话客观总评</SectionLabel>
        <p style={{
          fontSize: "0.67rem",
          color: "#9ca3af",
          marginBottom: 14,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          基于证据，不是建议
        </p>
        <ObjectiveSummary data={data} />
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
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.1rem", color: "#0f0f0f", letterSpacing: "-0.01em" }}>
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
            padding: "5px",
            paddingLeft: 16,
            background: "#fff",
            boxShadow: focused ? "0 0 0 3px rgba(15,15,15,0.05)" : "0 1px 3px rgba(0,0,0,0.04)",
            transition: "border-color 0.15s, box-shadow 0.15s",
            alignItems: "center",
            boxSizing: "border-box" as const,
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
                minWidth: 0,
                padding: 0,
              }}
            />
            <button
              onClick={() => search(ticker)}
              disabled={loading || !ticker.trim()}
              style={{
                padding: "9px 20px",
                borderRadius: 7,
                border: "none",
                flexShrink: 0,
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
            <p style={{ marginTop: 8, fontSize: "0.77rem", color: "#dc2626", paddingLeft: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              ⚠ {error}
            </p>
          )}
        </div>

        {/* Results */}
        {loading && <LoadingSkeleton />}
        {!loading && data && <ResultPanel data={data} />}
        {!loading && !data && !error && (
          <div style={{ textAlign: "center", paddingTop: 56 }}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ margin: "0 auto 12px", display: "block" }}>
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
