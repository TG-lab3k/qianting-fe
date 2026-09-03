"use client";

import { useEffect, useState } from "react";
import { getUserManager } from "@/core/user";
import {
  initHttpClient,
  setUnauthorizedHandler,
  resetUnauthorizedHandling,
  SESSION_EXPIRED_MESSAGE,
} from "@/core/http-client";
import {
  getStoredToken,
  getStoredRefreshToken,
  getStoredUser,
  authMe,
  authRefresh,
  saveAuthToStorage,
  clearAuthFromStorage,
  displayFromAuthUser,
  isAuthExpiredCode,
} from "@/core/auth";

/**
 * 应用入口：恢复登录态、初始化业务 http-client、校验 / 必要时 refresh。
 * 业务 API 返回 401 时清除本地登录态并提示重新登录。
 */
export function HttpClientInit() {
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  if (typeof window !== "undefined") {
    initHttpClient({
      getToken: () => getUserManager().getToken(),
    });
    setUnauthorizedHandler(() => {
      clearAuthFromStorage();
      getUserManager().logout();
      setSessionNotice(SESSION_EXPIRED_MESSAGE);
    });
  }

  useEffect(() => {
    getUserManager();

    const dismissLogin = getUserManager().onLogin(() => {
      resetUnauthorizedHandling();
      setSessionNotice(null);
    });

    const token = getStoredToken();
    if (!token) {
      return () => {
        dismissLogin();
        setUnauthorizedHandler(null);
      };
    }

    const stored = getStoredUser();
    getUserManager().setUser({
      token,
      name: stored?.name ?? "",
      avatar: stored?.avatar ?? "",
    });

    void (async () => {
      let access = token;
      let refresh = getStoredRefreshToken();

      let me = await authMe();

      if (!me.ok && isAuthExpiredCode(me.errorCode) && refresh) {
        const refreshed = await authRefresh(refresh);
        if (!refreshed.ok) {
          clearAuthFromStorage();
          getUserManager().logout();
          return;
        }
        access = refreshed.data.access_token;
        refresh = refreshed.data.refresh_token;
        const name = stored?.name ?? "";
        const avatar = stored?.avatar ?? "";
        saveAuthToStorage(access, refresh, name, avatar);
        getUserManager().login({ token: access, name, avatar });
        me = await authMe();
      }

      if (me.ok) {
        const { name, avatar } = displayFromAuthUser(me.data);
        const currentRefresh = getStoredRefreshToken() ?? refresh;
        getUserManager().login({ token: access, name, avatar });
        if (currentRefresh) {
          saveAuthToStorage(access, currentRefresh, name, avatar);
        }
      } else {
        clearAuthFromStorage();
        getUserManager().logout();
      }
    })();

    return () => {
      dismissLogin();
      setUnauthorizedHandler(null);
    };
  }, []);

  if (!sessionNotice) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        maxWidth: "min(420px, calc(100vw - 32px))",
        padding: "12px 16px",
        borderRadius: 10,
        background: "#0f0f0f",
        color: "#fff",
        fontSize: "0.875rem",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ flex: 1 }}>{sessionNotice}</span>
      <button
        type="button"
        onClick={() => setSessionNotice(null)}
        aria-label="关闭"
        style={{
          border: "none",
          background: "transparent",
          color: "#9ca3af",
          cursor: "pointer",
          fontSize: "1rem",
          lineHeight: 1,
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
