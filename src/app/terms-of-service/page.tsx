"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "zh" | "en";

// ─── Sub-components ───────────────────────────────────────────────────────────

function LogoIcon() {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        background: "#0f0f0f",
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 12 L5 7 L8 9 L11 4 L14 6.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function SectionHeader({
  num,
  title,
}: {
  num: string;
  title: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 14,
        marginBottom: 20,
        paddingBottom: 14,
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          fontWeight: 700,
          color: "#6b7280",
          letterSpacing: "0.1em",
          background: "#f3f4f6",
          padding: "2px 7px",
          borderRadius: 6,
          flexShrink: 0,
        }}
      >
        {num}
      </span>
      <span
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.2rem",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          color: "#0f0f0f",
        }}
      >
        {title}
      </span>
    </div>
  );
}

function RuleCard({
  dot = "neutral",
  children,
}: {
  dot?: "neutral" | "green" | "amber" | "red";
  children: React.ReactNode;
}) {
  const dotColor =
    dot === "green"
      ? "#16a34a"
      : dot === "amber"
      ? "#d97706"
      : dot === "red"
      ? "#dc2626"
      : "#e5e7eb";

  return (
    <div
      style={{
        background: "#fafafa",
        border: "1px solid #f3f4f6",
        borderRadius: 8,
        padding: "14px 18px",
        marginBottom: 10,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: dotColor,
          flexShrink: 0,
          marginTop: 7,
        }}
      />
      <span
        style={{
          fontSize: "0.85rem",
          color: "#374151",
          lineHeight: 1.65,
          fontFamily: "var(--font-sans)",
        }}
      >
        {children}
      </span>
    </div>
  );
}

function AlertBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(217,119,6,0.06)",
        border: "1px solid rgba(217,119,6,0.2)",
        borderRadius: 12,
        padding: "18px 22px",
        marginBottom: 40,
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: 1 }}>⚠️</span>
      <div
        style={{
          fontSize: "0.85rem",
          color: "#374151",
          lineHeight: 1.6,
          fontFamily: "var(--font-sans)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function CrucialTag() {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.6rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#dc2626",
        background: "rgba(220,38,38,0.08)",
        padding: "2px 6px",
        borderRadius: 4,
        verticalAlign: "middle",
        marginLeft: 8,
      }}
    >
      核心
    </span>
  );
}

function RefundCard({
  label,
  badgeText,
  badgeColor,
  title,
  desc,
}: {
  label: string;
  badgeText: string;
  badgeColor: "green" | "neutral";
  title: string;
  desc: string;
}) {
  const badgeStyle =
    badgeColor === "green"
      ? { background: "rgba(22,163,74,0.1)", color: "#16a34a" }
      : { background: "#f3f4f6", color: "#6b7280" };

  return (
    <div
      style={{
        background: "#fafafa",
        border: "1px solid #f3f4f6",
        borderRadius: 8,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#6b7280",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <span
        style={{
          display: "inline-block",
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          fontWeight: 700,
          padding: "2px 7px",
          borderRadius: 4,
          marginBottom: 8,
          ...badgeStyle,
        }}
      >
        {badgeText}
      </span>
      <div
        style={{
          fontSize: "0.88rem",
          fontWeight: 600,
          color: "#0f0f0f",
          marginBottom: 6,
          fontFamily: "var(--font-sans)",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "0.8rem",
          color: "#6b7280",
          lineHeight: 1.55,
          fontFamily: "var(--font-sans)",
        }}
      >
        {desc}
      </div>
    </div>
  );
}

function ProhibitedItem({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "12px 0",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          fontWeight: 700,
          color: "#dc2626",
          background: "rgba(220,38,38,0.08)",
          padding: "2px 6px",
          borderRadius: 4,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        禁止
      </span>
      <span
        style={{
          fontSize: "0.85rem",
          color: "#374151",
          lineHeight: 1.6,
          fontFamily: "var(--font-sans)",
        }}
      >
        {children}
      </span>
    </div>
  );
}

function ContactCard({ role, email }: { role: string; email: string }) {
  return (
    <div
      style={{
        background: "#fafafa",
        border: "1px solid #f3f4f6",
        borderRadius: 8,
        padding: "14px 16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#6b7280",
          marginBottom: 6,
        }}
      >
        {role}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          color: "#0f0f0f",
          wordBreak: "break-all",
        }}
      >
        {email}
      </div>
    </div>
  );
}

// ─── Content Data ─────────────────────────────────────────────────────────────

const contacts = [
  { roleZh: "法律事务", roleEn: "Legal", email: "legal@qianting.xyz" },
  { roleZh: "隐私事务", roleEn: "Privacy", email: "privacy@qianting.xyz" },
  { roleZh: "安全漏洞", roleEn: "Security", email: "security@qianting.xyz" },
];

const sectionStyle: React.CSSProperties = { marginBottom: 40 };
const bodyText: React.CSSProperties = {
  color: "#374151",
  fontSize: "0.88rem",
  lineHeight: 1.75,
  fontFamily: "var(--font-sans)",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TermsOfServicePage() {
  const [lang, setLang] = useState<Lang>("zh");
  const zh = lang === "zh";

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* ── Sticky Header ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #f3f4f6",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 860,
            margin: "0 auto",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              color: "#0f0f0f",
            }}
          >
            <LogoIcon />
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.1rem",
                letterSpacing: "-0.02em",
              }}
            >
              Qianting
            </span>
          </Link>
          <Badge
            variant="outline"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#6b7280",
              background: "#f3f4f6",
              border: "none",
              padding: "3px 9px",
              borderRadius: 6,
            }}
          >
            Legal
          </Badge>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px 100px" }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: 56 }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#6b7280",
              marginBottom: 14,
            }}
          >
            Legal · qianting.xyz
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 5vw, 2.8rem)",
              fontWeight: 400,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              color: "#0f0f0f",
              marginBottom: 16,
            }}
          >
            服务条款
            <br />
            Terms of Service
          </h1>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { label: "版本 v1.1" },
              { label: "生效日期 2026-03-01" },
              { label: "最后更新 2026-02-28" },
            ].map((m) => (
              <span
                key={m.label}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#e5e7eb",
                    display: "inline-block",
                  }}
                />
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Language Toggle ── */}
        <div
          style={{
            display: "inline-flex",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 48,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          {(["zh", "en"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: "8px 20px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                background: lang === l ? "#0f0f0f" : "transparent",
                color: lang === l ? "#fff" : "#6b7280",
                transition: "all 0.15s",
                letterSpacing: "0.01em",
              }}
            >
              {l === "zh" ? "中文" : "English"}
            </button>
          ))}
        </div>

        {/* ── Alert Banner ── */}
        <AlertBanner>
          {zh ? (
            <>
              <strong style={{ color: "#d97706" }}>重要提示：</strong>访问或使用 qianting.xyz（"本平台"）即表示您同意本条款。如不同意，请立即停止使用。本平台提供量化分析工具，
              <strong style={{ color: "#d97706" }}>不构成任何投资建议。</strong>
            </>
          ) : (
            <>
              <strong style={{ color: "#d97706" }}>Important:</strong> By accessing qianting.xyz (&quot;the Platform&quot;), you agree to these Terms. If you disagree, please cease use immediately. The Platform provides quantitative analysis tools and{" "}
              <strong style={{ color: "#d97706" }}>does NOT constitute investment advice.</strong>
            </>
          )}
        </AlertBanner>

        {/* ════════════════════════════════════════════════════════
            S1 · 核心量化免责声明
        ════════════════════════════════════════════════════════ */}
        <div style={sectionStyle}>
          <SectionHeader
            num="01"
            title={
              <>
                {zh ? "核心量化免责声明" : "Quantitative Disclaimer"}
                <CrucialTag />
              </>
            }
          />
          <div style={bodyText}>
            <RuleCard dot="amber">
              {zh ? (
                <>
                  <strong style={{ color: "#0f0f0f" }}>算法状态标签说明：</strong>
                  本平台输出的"BUY（买入信号区）"、"WATCH（观察区）"或"NO（无信号）"仅为基于历史数据回测模型的算法状态标签，用于描述统计学上的概率分布，
                  <strong style={{ color: "#0f0f0f" }}>不构成对任何特定证券的投资建议、买卖指令或收益保证。</strong>
                </>
              ) : (
                <>
                  <strong style={{ color: "#0f0f0f" }}>Algorithmic Labels:</strong>{" "}
                  The &quot;BUY,&quot; &quot;WATCH,&quot; or &quot;NO&quot; outputs are algorithmic status labels based on historical backtesting models. They describe statistical probability distributions and{" "}
                  <strong style={{ color: "#0f0f0f" }}>do NOT constitute investment advice, trade instructions, or profit guarantees</strong> for any specific security.
                </>
              )}
            </RuleCard>
            <RuleCard>
              {zh ? (
                <>
                  <strong style={{ color: "#0f0f0f" }}>非持牌声明：</strong>
                  本平台并非持牌投资顾问、经纪商或金融机构。我们不针对您的个人财务状况提供定制化建议。本平台提供的服务属于"出版商豁免"范畴，即向公众提供非个性化的、基于事实和算法的市场评论。
                </>
              ) : (
                <>
                  <strong style={{ color: "#0f0f0f" }}>No Licensing:</strong>{" "}
                  We are not a licensed investment advisor, broker, or financial institution. We do not provide personalized advice based on your financial situation. Our services fall under the &quot;Publisher&apos;s Exclusion,&quot; providing non-personalized, fact-based algorithmic market commentary.
                </>
              )}
            </RuleCard>
            <RuleCard dot="red">
              {zh ? (
                <>
                  <strong style={{ color: "#0f0f0f" }}>盈亏自负：</strong>
                  证券投资具有本金损失风险。您基于本平台数据（如 Flow Tape 或 Bottom Detector）做出的决策，其产生的任何直接或间接盈亏由您自行承担。
                </>
              ) : (
                <>
                  <strong style={{ color: "#0f0f0f" }}>Assumption of Risk:</strong>{" "}
                  Investing involves risk, including loss of principal. Any decisions made based on Platform data (e.g., Flow Tape, Bottom Detector) are at your sole risk. Any resulting gains or losses are entirely your own.
                </>
              )}
            </RuleCard>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            S2 · 数据来源与局限性
        ════════════════════════════════════════════════════════ */}
        <div style={sectionStyle}>
          <SectionHeader
            num="02"
            title={zh ? "数据来源与局限性" : "Data Limitations"}
          />
          <div style={bodyText}>
            <RuleCard>
              {zh ? (
                <>
                  <strong style={{ color: "#0f0f0f" }}>模型推估：</strong>
                  BuyProxyVol 与 Imbalance 等指标为基于成交量行为的统计学推估值，并非交易所实时逐笔原始成交数据。
                </>
              ) : (
                <>
                  <strong style={{ color: "#0f0f0f" }}>Statistical Estimation:</strong>{" "}
                  Metrics like BuyProxyVol and Imbalance are statistical estimations based on volume behavior, not real-time tick-by-tick exchange data.
                </>
              )}
            </RuleCard>
            <RuleCard>
              {zh ? (
                <>
                  <strong style={{ color: "#0f0f0f" }}>历史局限：</strong>
                  量化模型基于历史表现，历史数据不预示未来结果。
                </>
              ) : (
                <>
                  <strong style={{ color: "#0f0f0f" }}>Historical Bias:</strong>{" "}
                  Quantitative models are based on historical performance; past performance is not indicative of future results.
                </>
              )}
            </RuleCard>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            S3 · 订阅与退款
        ════════════════════════════════════════════════════════ */}
        <div style={sectionStyle}>
          <SectionHeader
            num="03"
            title={zh ? "订阅与退款（通过 Stripe）" : "Subscriptions & Refunds (via Stripe)"}
          />
          <div style={bodyText}>
            <p style={{ marginBottom: 16 }}>
              {zh
                ? "付费功能通过 Stripe 处理，采用自动续费模式。"
                : "Paid features are processed via Stripe on an automatic renewal basis."}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              <RefundCard
                label={zh ? "年度订阅" : "Annual Plan"}
                badgeText={zh ? "✓ 可退款" : "✓ Refundable"}
                badgeColor="green"
                title={zh ? "首次付款后 7 天内" : "Within 7 days of first payment"}
                desc={
                  zh
                    ? "可申请全额退款，无条件，适用于首次订购用户。"
                    : "Full refund available, no questions asked. Applies to first-time subscribers only."
                }
              />
              <RefundCard
                label={zh ? "月度订阅" : "Monthly Plan"}
                badgeText={zh ? "不退款" : "Non-refundable"}
                badgeColor="neutral"
                title={zh ? "可随时取消续费" : "Cancel anytime"}
                desc={
                  zh
                    ? "不提供按比例退款，但可随时取消，下一计费周期不再扣款。"
                    : "No pro-rated refunds, but you may cancel at any time to prevent the next billing cycle."
                }
              />
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            S4 · 禁止行为
        ════════════════════════════════════════════════════════ */}
        <div style={sectionStyle}>
          <SectionHeader
            num="04"
            title={zh ? "禁止行为" : "Prohibited Conduct"}
          />
          <div style={bodyText}>
            <div>
              <ProhibitedItem>
                {zh
                  ? "利用爬虫或自动化工具批量抓取 API（api.qianting.xyz）数据。"
                  : "Using bots or automated tools to scrape data from the API (api.qianting.xyz) in bulk."}
              </ProhibitedItem>
              <ProhibitedItem>
                {zh
                  ? "将本平台内容用于非法证券投资咨询服务，无论是否收费。"
                  : "Using Platform content for illegal investment advisory services, whether for compensation or not."}
              </ProhibitedItem>
              <ProhibitedItem>
                {zh
                  ? "对本平台进行逆向工程、反编译或以其他方式获取源代码或算法模型。"
                  : "Reverse engineering, decompiling, or otherwise attempting to extract source code or algorithm models."}
              </ProhibitedItem>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  padding: "12px 0",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#dc2626",
                    background: "rgba(220,38,38,0.08)",
                    padding: "2px 6px",
                    borderRadius: 4,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  禁止
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "#374151",
                    lineHeight: 1.6,
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {zh
                    ? "冒充本平台或传播虚假信息，干扰、破坏平台服务器或基础设施资源。"
                    : "Impersonating the Platform or spreading false information, or disrupting Platform infrastructure."}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            S5 · 责任限制
        ════════════════════════════════════════════════════════ */}
        <div style={sectionStyle}>
          <SectionHeader
            num="05"
            title={zh ? "责任限制" : "Limitation of Liability"}
          />
          <div style={bodyText}>
            <RuleCard>
              {zh
                ? "本平台不对您依据分析结果做出投资决策所导致的任何经济损失承担责任。"
                : "The Platform is not liable for any economic loss arising from investment decisions made based on our analysis outputs."}
            </RuleCard>
            <RuleCard>
              {zh ? (
                <><strong style={{ color: "#0f0f0f" }}>付费用户：</strong>最高赔偿额不超过您在过去 12 个月内实际支付的费用总额。</>
              ) : (
                <><strong style={{ color: "#0f0f0f" }}>Paid users:</strong> Total liability shall not exceed fees actually paid in the 12 months prior to the claim.</>
              )}
            </RuleCard>
            <RuleCard>
              {zh ? (
                <><strong style={{ color: "#0f0f0f" }}>免费用户：</strong>最高赔偿额不超过人民币 100 元（或等值当地货币）。</>
              ) : (
                <><strong style={{ color: "#0f0f0f" }}>Free users:</strong> Total liability shall not exceed CNY 100 (or equivalent in local currency).</>
              )}
            </RuleCard>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            S6 · 知识产权
        ════════════════════════════════════════════════════════ */}
        <div style={sectionStyle}>
          <SectionHeader
            num="06"
            title={zh ? "知识产权" : "Intellectual Property"}
          />
          <div style={bodyText}>
            <p style={{ marginBottom: 16 }}>
              {zh
                ? "本平台软件代码、算法体系（七维评分、Flow Tape、Bottom Detector）、界面设计及品牌标识均为 Qianting 专有财产，受著作权法及国际知识产权条约保护。"
                : "All software code, algorithm systems (7-dimension scoring, Flow Tape, Bottom Detector), interface design, and brand identity are the exclusive property of Qianting, protected by copyright law and international intellectual property treaties."}
            </p>
            <RuleCard dot="green">
              {zh ? (
                <>您可将分析结果用于<strong style={{ color: "#0f0f0f" }}>个人投资研究</strong>，并可在社交媒体中分享截图，但须注明来源"Qianting · qianting.xyz"。</>
              ) : (
                <>You may use analysis outputs for <strong style={{ color: "#0f0f0f" }}>personal investment research</strong> and share screenshots on social media with attribution to &quot;Qianting · qianting.xyz.&quot;</>
              )}
            </RuleCard>
            <RuleCard dot="red">
              {zh
                ? "未经书面许可，不得商业出售分析数据或将其集成入商业产品。"
                : "Without written permission, you may not commercially sell analysis data or integrate outputs into commercial products."}
            </RuleCard>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            S7 · 适用法律与争议解决
        ════════════════════════════════════════════════════════ */}
        <div style={sectionStyle}>
          <SectionHeader
            num="07"
            title={zh ? "适用法律与争议解决" : "Governing Law & Dispute Resolution"}
          />
          <div style={bodyText}>
            <p style={{ marginBottom: 12 }}>
              {zh
                ? "本条款受中华人民共和国法律管辖。争议优先友好协商解决（协商期不少于 30 天），协商不成的，提交本平台运营主体所在地有管辖权的人民法院诉讼解决。"
                : "These Terms are governed by the laws of the People's Republic of China. Disputes shall first be resolved through good-faith negotiation (minimum 30 days), failing which they shall be submitted to a court of competent jurisdiction at the Platform operator's registered location."}
            </p>
            <p>
              {zh
                ? "对于知识产权侵权，本平台保留直接向法院申请临时禁令救济的权利。"
                : "For intellectual property infringement, the Platform reserves the right to seek immediate injunctive relief from a court without prior negotiation."}
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            S8 · 联系方式
        ════════════════════════════════════════════════════════ */}
        <div style={sectionStyle}>
          <SectionHeader
            num="08"
            title={zh ? "联系方式" : "Contact"}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
            }}
          >
            {contacts.map((c) => (
              <ContactCard
                key={c.email}
                role={zh ? c.roleZh : c.roleEn}
                email={c.email}
              />
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            marginTop: 64,
            paddingTop: 24,
            borderTop: "1px solid #f3f4f6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "#6b7280" }}>
            © 2026 Qianting · 保留所有权利 · v1.1
          </span>
          <div style={{ display: "flex", gap: 16 }}>
            <Link
              href="/privacy-policy"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                color: "#6b7280",
                textDecoration: "none",
              }}
            >
              {zh ? "隐私政策" : "Privacy Policy"}
            </Link>
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                color: "#6b7280",
                textDecoration: "none",
              }}
            >
              qianting.xyz
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
