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

function DataTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        background: "#f3f4f6",
        color: "#374151",
        padding: "2px 7px",
        borderRadius: 4,
      }}
    >
      {children}
    </span>
  );
}

function DataCard({
  label,
  tags,
}: {
  label: string;
  tags: string[];
}) {
  return (
    <div
      style={{
        background: "#fafafa",
        border: "1px solid #f3f4f6",
        borderRadius: 8,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#6b7280",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {tags.map((t) => (
          <DataTag key={t}>{t}</DataTag>
        ))}
      </div>
    </div>
  );
}

function RetentionTable({
  rows,
}: {
  rows: { type: string; period: string }[];
}) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
      <thead>
        <tr>
          {["数据类型 / Data Type", "保留期限 / Period"].map((h) => (
            <th
              key={h}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#6b7280",
                padding: "8px 12px",
                textAlign: "left",
                background: "#f3f4f6",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <td
              style={{
                padding: "10px 12px",
                color: "#0f0f0f",
                fontWeight: 500,
                borderBottom: i < rows.length - 1 ? "1px solid #f3f4f6" : "none",
                fontFamily: "var(--font-sans)",
              }}
            >
              {row.type}
            </td>
            <td
              style={{
                padding: "10px 12px",
                borderBottom: i < rows.length - 1 ? "1px solid #f3f4f6" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  color: "#6b7280",
                  background: "#f3f4f6",
                  padding: "2px 7px",
                  borderRadius: 4,
                }}
              >
                {row.period}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RightItem({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "#fafafa",
        border: "1px solid #f3f4f6",
        borderRadius: 8,
        padding: "12px 14px",
      }}
    >
      <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>{icon}</span>
      <div>
        <div
          style={{
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "#0f0f0f",
            marginBottom: 2,
            fontFamily: "var(--font-sans)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "0.76rem",
            color: "#6b7280",
            lineHeight: 1.5,
            fontFamily: "var(--font-sans)",
          }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
}

function ThirdPartyChip({ name, role }: { name: string; role: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#fafafa",
        border: "1px solid #f3f4f6",
        borderRadius: 8,
        padding: "8px 14px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#0f0f0f",
        }}
      >
        {name}
      </span>
      <span style={{ fontSize: "0.72rem", color: "#6b7280", fontFamily: "var(--font-sans)" }}>
        {role}
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

const retentionRowsZh = [
  { type: "股票代码查询记录", period: "账户注销后 90 天" },
  { type: "账户信息", period: "注销请求后 30 天" },
  { type: "支付与交易记录", period: "至少 7 年（税务合规）" },
  { type: "访问日志（GCP / Cloudflare）", period: "最长 90 天" },
  { type: "安全事件记录", period: "最长 2 年" },
];

const retentionRowsEn = [
  { type: "Ticker query records", period: "90 days after account deletion" },
  { type: "Account information", period: "30 days after deletion request" },
  { type: "Payment & transaction records", period: "At least 7 years (tax compliance)" },
  { type: "Access logs (GCP / Cloudflare)", period: "Up to 90 days" },
  { type: "Security incident records", period: "Up to 2 years" },
];

const rightsZh = [
  { icon: "📋", title: "访问权", desc: "请求获取我们持有的您的个人数据副本" },
  { icon: "✏️", title: "更正权", desc: "要求更正不准确或不完整的个人数据" },
  { icon: "🗑️", title: "删除权（被遗忘权）", desc: "要求删除您的个人数据（法律保留数据除外）" },
  { icon: "📦", title: "数据可携带权", desc: "以机器可读格式接收您的数据" },
  { icon: "🚫", title: "反对权", desc: "反对基于合法权益的数据处理" },
  { icon: "↩️", title: "撤回同意权", desc: "随时撤回您此前给予的同意" },
];

const rightsEn = [
  { icon: "📋", title: "Right of Access", desc: "Request a copy of your personal data we hold" },
  { icon: "✏️", title: "Right to Rectification", desc: "Correct inaccurate or incomplete personal data" },
  { icon: "🗑️", title: "Right to Erasure", desc: "Request deletion of your data (except legally required records)" },
  { icon: "📦", title: "Data Portability", desc: "Receive your data in a machine-readable format" },
  { icon: "🚫", title: "Right to Object", desc: "Object to processing based on legitimate interests" },
  { icon: "↩️", title: "Withdraw Consent", desc: "Withdraw previously given consent at any time" },
];

const thirdPartiesZh = [
  { name: "Google Cloud", role: "后端计算 · Firestore · CDN" },
  { name: "Cloudflare", role: "CDN · DDoS · WAF" },
  { name: "Stripe", role: "支付处理（即将上线）" },
  { name: "Google OAuth", role: "身份验证（即将上线）" },
];

const thirdPartiesEn = [
  { name: "Google Cloud", role: "Backend · Firestore · Storage" },
  { name: "Cloudflare", role: "CDN · DDoS · WAF" },
  { name: "Stripe", role: "Payment processing (coming soon)" },
  { name: "Google OAuth", role: "Authentication (coming soon)" },
];

const contacts = [
  { roleZh: "隐私事务", roleEn: "Privacy", email: "privacy@qianting.xyz" },
  { roleZh: "安全漏洞", roleEn: "Security", email: "security@qianting.xyz" },
  { roleZh: "法律事务", roleEn: "Legal", email: "legal@qianting.xyz" },
];

// ─── Section Body styles ──────────────────────────────────────────────────────

const bodyText: React.CSSProperties = {
  color: "#374151",
  fontSize: "0.88rem",
  lineHeight: 1.75,
  fontFamily: "var(--font-sans)",
};

const sectionStyle: React.CSSProperties = { marginBottom: 40 };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrivacyPolicyPage() {
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
            隐私政策
            <br />
            Privacy Policy
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

        {/* ════════════════════════════════════════════════════════
            S1 · 信息收集
        ════════════════════════════════════════════════════════ */}
        <div style={sectionStyle}>
          <SectionHeader
            num="01"
            title={zh ? "信息收集" : "Information Collection"}
          />
          <div style={bodyText}>
            <p style={{ marginBottom: 16 }}>
              {zh
                ? "我们收集以下类型的信息以提供量化分析服务："
                : "We collect the following types of information to provide our quantitative analysis service:"}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <DataCard
                label={zh ? "主动提供" : "User-Provided"}
                tags={
                  zh
                    ? ["股票代码查询", "Google UID", "邮箱地址", "头像 URL", "Stripe 支付元数据"]
                    : ["Ticker queries", "Google UID", "Email address", "Avatar URL", "Stripe payment metadata"]
                }
              />
              <DataCard
                label={zh ? "技术日志（自动）" : "Technical Logs (auto)"}
                tags={
                  zh
                    ? ["IP 地址（截断）", "访问路径", "浏览器类型", "设备信息", "访问时间戳"]
                    : ["IP address (truncated)", "Access paths", "Browser type", "Device info", "Timestamps"]
                }
              />
            </div>
            <RuleCard dot="green">
              {zh ? (
                <>
                  <strong style={{ color: "#0f0f0f" }}>不收集：</strong>
                  我们不收集您的实际投资组合、持仓数量、银行账户信息，也不故意收集 18 岁以下未成年人的个人信息。支付数据由 Stripe 直接处理，不经过本平台服务器存储。
                </>
              ) : (
                <>
                  <strong style={{ color: "#0f0f0f" }}>We do NOT collect:</strong>{" "}
                  actual portfolio holdings, bank account information, or intentionally collect personal information from users under 18. Payment data is processed directly by Stripe and never stored on our servers.
                </>
              )}
            </RuleCard>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            S2 · 跨境数据传输
        ════════════════════════════════════════════════════════ */}
        <div style={sectionStyle}>
          <SectionHeader
            num="02"
            title={zh ? "跨境数据传输（PIPL 合规）" : "Cross-Border Data Transfer (PIPL Compliance)"}
          />
          <div style={bodyText}>
            <div
              style={{
                background: "rgba(15,15,15,0.03)",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "20px 24px",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#6b7280",
                  marginBottom: 8,
                }}
              >
                {zh ? "传输声明" : "Transfer Statement"}
              </div>
              <p style={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.65 }}>
                {zh ? (
                  <>
                    为提供全球化的量化分析服务，您的个人信息（如邮箱、查询历史）将传输至位于{" "}
                    <strong style={{ color: "#0f0f0f" }}>美国或亚洲</strong>
                    {" "}的 Google Cloud 服务器存储。我们通过标准合同条款（SCCs）及 Cloudflare 的安全防护确保跨境数据安全。
                  </>
                ) : (
                  <>
                    To provide global quantitative services, your personal information (e.g., email, query history) will be transferred to and stored on Google Cloud servers located in the{" "}
                    <strong style={{ color: "#0f0f0f" }}>U.S. or Asia</strong>. We ensure security through Standard Contractual Clauses (SCCs) and Cloudflare&apos;s protection.
                  </>
                )}
              </p>
            </div>
            <RuleCard dot="amber">
              {zh
                ? "点击\“同意\“即视为您明确同意该跨境传输。我们与 GCP 和 Cloudflare 签订的数据处理协议（DPA）包含标准合同条款（SCCs），并依赖服务提供商的合规认证（ISO 27001、SOC 2）。"
                : "By clicking \"Agree,\" you provide explicit consent for this cross-border transfer. Our DPAs with GCP and Cloudflare include SCCs, and we rely on providers' compliance certifications (ISO 27001, SOC 2)."}
            </RuleCard>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            S3 · 使用目的
        ════════════════════════════════════════════════════════ */}
        <div style={sectionStyle}>
          <SectionHeader
            num="03"
            title={zh ? "使用目的" : "Purpose of Use"}
          />
          <div style={bodyText}>
            <RuleCard>
              {zh ? (
                <><strong style={{ color: "#0f0f0f" }}>服务提供：</strong>处理股票代码查询，计算并返回量化分析结果。</>
              ) : (
                <><strong style={{ color: "#0f0f0f" }}>Service delivery:</strong> Processing ticker queries and returning quantitative analysis results.</>
              )}
            </RuleCard>
            <RuleCard>
              {zh ? (
                <><strong style={{ color: "#0f0f0f" }}>账户与支付：</strong>创建和维护用户账户，通过 Stripe 处理订阅付款，管理账单记录。</>
              ) : (
                <><strong style={{ color: "#0f0f0f" }}>Account & payments:</strong> Creating and maintaining user accounts; processing subscriptions via Stripe; managing billing records.</>
              )}
            </RuleCard>
            <RuleCard>
              {zh ? (
                <><strong style={{ color: "#0f0f0f" }}>安全保障：</strong>检测和防御欺诈、滥用、DDoS 攻击及其他安全威胁。</>
              ) : (
                <><strong style={{ color: "#0f0f0f" }}>Security:</strong> Detecting and defending against fraud, abuse, DDoS attacks, and other security threats.</>
              )}
            </RuleCard>
            <RuleCard dot="green">
              {zh ? (
                <><strong style={{ color: "#0f0f0f" }}>我们不会做的：</strong>不出售、出租您的个人信息；不用于定向广告投放；不未经授权与任何非服务提供商的第三方共享您的数据。</>
              ) : (
                <><strong style={{ color: "#0f0f0f" }}>We will NOT:</strong> sell or rent your personal information; use it for targeted advertising; share it with any non-service-provider third parties without authorization.</>
              )}
            </RuleCard>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            S4 · 数据保留期限
        ════════════════════════════════════════════════════════ */}
        <div style={sectionStyle}>
          <SectionHeader
            num="04"
            title={zh ? "数据保留期限" : "Data Retention"}
          />
          <div style={bodyText}>
            <RetentionTable rows={zh ? retentionRowsZh : retentionRowsEn} />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            S5 · 您的权利
        ════════════════════════════════════════════════════════ */}
        <div style={sectionStyle}>
          <SectionHeader
            num="05"
            title={zh ? "您的数据权利" : "Your Data Rights"}
          />
          <div style={bodyText}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {(zh ? rightsZh : rightsEn).map((r) => (
                <RightItem key={r.title} icon={r.icon} title={r.title} desc={r.desc} />
              ))}
            </div>
            <p>
              {zh ? (
                <>如需行使上述权利，请联系 <strong style={{ color: "#0f0f0f" }}>privacy@qianting.xyz</strong>，我们将在 30 天内响应。</>
              ) : (
                <>To exercise any of these rights, contact <strong style={{ color: "#0f0f0f" }}>privacy@qianting.xyz</strong>. We will respond within 30 days.</>
              )}
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            S6 · 第三方服务
        ════════════════════════════════════════════════════════ */}
        <div style={sectionStyle}>
          <SectionHeader
            num="06"
            title={zh ? "第三方服务" : "Third-Party Services"}
          />
          <div style={bodyText}>
            <p style={{ marginBottom: 16 }}>
              {zh
                ? "本平台集成以下第三方服务，其数据处理受各方独立隐私政策约束，我们与其签订数据处理协议（DPA）："
                : "The Platform integrates the following third-party services. Their data processing is governed by their respective privacy policies, and we have executed Data Processing Agreements (DPAs) with each:"}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(zh ? thirdPartiesZh : thirdPartiesEn).map((tp) => (
                <ThirdPartyChip key={tp.name} name={tp.name} role={tp.role} />
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            S7 · 数据安全
        ════════════════════════════════════════════════════════ */}
        <div style={sectionStyle}>
          <SectionHeader
            num="07"
            title={zh ? "数据安全" : "Data Security"}
          />
          <div style={bodyText}>
            <RuleCard dot="green">
              {zh ? (
                <><strong style={{ color: "#0f0f0f" }}>传输加密：</strong>所有通信通过 TLS 1.2+ 加密；GCP 提供静态数据 AES-256 加密。</>
              ) : (
                <><strong style={{ color: "#0f0f0f" }}>Encryption in transit:</strong> All communications use TLS 1.2+; GCP provides AES-256 encryption at rest.</>
              )}
            </RuleCard>
            <RuleCard dot="green">
              {zh ? (
                <><strong style={{ color: "#0f0f0f" }}>访问控制：</strong>员工对用户数据的访问遵循最小权限原则，并记录访问日志。</>
              ) : (
                <><strong style={{ color: "#0f0f0f" }}>Access control:</strong> Employee access to user data follows the principle of least privilege and is logged.</>
              )}
            </RuleCard>
            <RuleCard>
              {zh ? (
                <>如发现安全漏洞，请联系 <strong style={{ color: "#0f0f0f" }}>security@qianting.xyz</strong>。尽管我们采取行业标准安全措施，没有任何系统能保证 100% 安全。</>
              ) : (
                <>To report a security vulnerability, contact <strong style={{ color: "#0f0f0f" }}>security@qianting.xyz</strong>. While we apply industry-standard security measures, no system can guarantee 100% security.</>
              )}
            </RuleCard>
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
              href="/terms-of-service"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                color: "#6b7280",
                textDecoration: "none",
              }}
            >
              {zh ? "服务条款" : "Terms of Service"}
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
