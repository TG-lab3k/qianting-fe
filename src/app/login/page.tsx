"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  oauthAuthorize,
  setPendingCallbackUrl,
  HARBOR_APP_ID,
  getOAuthRedirectUri,
  sanitizeCallbackUrl,
  mapAuthErrorMessage,
} from "@/core/auth";
import { GoogleLogo } from "@/components/ui/google-logo";

function LoginContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  async function handleGoogleLogin() {
    setError(null);
    if (!HARBOR_APP_ID) {
      setError("认证未配置，请设置 NEXT_PUBLIC_HARBOR_APP_ID");
      return;
    }
    setLoading(true);
    try {
      const redirectUri = getOAuthRedirectUri();
      setPendingCallbackUrl(sanitizeCallbackUrl(callbackUrl));
      const res = await oauthAuthorize(redirectUri);
      if (!res.ok) {
        setError(mapAuthErrorMessage(res.errorCode, res.errorMessage));
        return;
      }
      window.location.assign(res.data.authorize_url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "登录失败，请重试";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "#fafafa",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          padding: 32,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#0f0f0f",
          }}
        >
          登录
        </h1>
        <p style={{ margin: "0 0 24px", fontSize: "0.9rem", color: "#6b7280" }}>
          使用 Google 账号登录后使用完整功能
        </p>
        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 12px",
              background: "#fef2f2",
              color: "#b91c1c",
              borderRadius: 8,
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#0f0f0f",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <GoogleLogo />
          {loading ? "登录中…" : "使用 Google 登录"}
        </button>
        <p style={{ marginTop: 20, fontSize: "0.8rem", color: "#9ca3af" }}>
          <Link href="/" style={{ color: "#6b7280", textDecoration: "none" }}>
            返回首页
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fafafa",
          }}
        >
          <span style={{ color: "#9ca3af", fontSize: "0.9rem" }}>加载中…</span>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
