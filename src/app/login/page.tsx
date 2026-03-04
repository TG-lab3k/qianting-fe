"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authLogin, saveAuthToStorage } from "@/core/auth";
import { getUserManager } from "@/core/user";
import { signInWithGoogle, getIdToken } from "@/core/firebase";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      if (!user) {
        setError("登录已取消");
        return;
      }
      const idToken = await getIdToken(user);
      const res = await authLogin(idToken);
      if (!res.ok) {
        if (res.errorCode === 401) setError("登录无效或已过期，请重试");
        else if (res.errorCode === 503) setError("服务暂不可用，请稍后重试");
        else setError(res.errorMessage || "登录失败");
        return;
      }
      const { access_token, user: authUser } = res.data;
      const name = authUser.display_name ?? authUser.email ?? "";
      const avatar = authUser.photo_url ?? "";
      saveAuthToStorage(access_token, name, avatar);
      getUserManager().login({
        token: access_token,
        name,
        avatar,
      });
      router.replace(callbackUrl);
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
          }}
        >
          {loading ? "登录中…" : "使用 Google 登录"}
        </button>
        <p style={{ marginTop: 20, fontSize: "0.8rem", color: "#9ca3af" }}>
          <a href="/" style={{ color: "#6b7280", textDecoration: "none" }}>
            返回首页
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
        <span style={{ color: "#9ca3af", fontSize: "0.9rem" }}>加载中…</span>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
