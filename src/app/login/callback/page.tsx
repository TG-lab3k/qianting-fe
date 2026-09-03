"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserManager } from "@/core/user";
import {
  oauthCallback,
  saveAuthToStorage,
  consumePendingCallbackUrl,
  getOAuthRedirectUri,
  displayFromLoginResult,
  mapAuthErrorMessage,
} from "@/core/auth";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const [error, setError] = useState<string | null>(
    code ? null : "登录已取消或回调无效"
  );
  const ran = useRef(false);

  useEffect(() => {
    if (!code || ran.current) return;
    ran.current = true;

    let cancelled = false;
    void (async () => {
      try {
        const redirectUri = getOAuthRedirectUri();
        const res = await oauthCallback(code, redirectUri, state);
        if (cancelled) return;
        if (!res.ok) {
          setError(mapAuthErrorMessage(res.errorCode, res.errorMessage));
          return;
        }
        const { access_token, refresh_token } = res.data;
        const { name, avatar } = displayFromLoginResult(res.data);
        saveAuthToStorage(access_token, refresh_token, name, avatar);
        getUserManager().login({
          token: access_token,
          name,
          avatar,
        });
        router.replace(consumePendingCallbackUrl());
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "登录失败，请重试");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, state, router]);

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
          textAlign: "center",
        }}
      >
        {error ? (
          <>
            <p style={{ margin: "0 0 16px", color: "#b91c1c", fontSize: "0.9rem" }}>
              {error}
            </p>
            <Link
              href="/login"
              style={{ color: "#6b7280", fontSize: "0.875rem", textDecoration: "none" }}
            >
              返回登录
            </Link>
          </>
        ) : (
          <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>
            登录处理中…
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginCallbackPage() {
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
      <CallbackContent />
    </Suspense>
  );
}
