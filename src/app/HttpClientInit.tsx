"use client";

import { useEffect } from "react";
import { getUserManager } from "@/core/user";
import { initHttpClient } from "@/core/http-client";
import { getStoredToken, getStoredUser } from "@/core/auth";

/**
 * 在应用入口：从 sessionStorage 恢复登录态，初始化 http-client（从 UserManager 读 token，自动带 Authorization）。
 */
export function HttpClientInit() {
  useEffect(() => {
    getUserManager();
    const token = getStoredToken();
    if (token) {
      const stored = getStoredUser();
      getUserManager().setUser({
        token,
        name: stored?.name ?? "",
        avatar: stored?.avatar ?? "",
      });
    }
    initHttpClient({
      getToken: () => getUserManager().getToken(),
    });
  }, []);
  return null;
}
