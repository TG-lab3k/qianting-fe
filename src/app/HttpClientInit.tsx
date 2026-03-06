"use client";

import { useEffect } from "react";
import { getUserManager } from "@/core/user";
import { initHttpClient } from "@/core/http-client";
import {
  getStoredToken,
  getStoredUser,
  authMe,
  saveAuthToStorage,
  clearAuthFromStorage,
} from "@/core/auth";

/**
 * 在应用入口：从 localStorage 恢复登录态，初始化 http-client（从 UserManager 读 token，自动带 Authorization）。
 * 若有本地 token 则调用 GET /auth/me 校验并拉取用户信息，成功则更新 UserManager 与本地缓存，失败则清除并展示未登录。
 * initHttpClient 在首帧同步执行，避免子组件在 useEffect 之前发起请求时报错。
 */
export function HttpClientInit() {
  useEffect(() => {
    getUserManager();
    const token = getStoredToken();
    if (!token) return;

    const stored = getStoredUser();
    getUserManager().setUser({
      token,
      name: stored?.name ?? "",
      avatar: stored?.avatar ?? "",
    });

    authMe().then((res) => {
      if (res.ok) {
        const u = res.data;
        const name = u.display_name ?? u.email ?? "";
        const avatar = u.photo_url ?? "";
        getUserManager().login({ token, name, avatar });
        saveAuthToStorage(token, name, avatar);
      } else {
        clearAuthFromStorage();
        getUserManager().logout();
      }
    });
  }, []);

  // 仅在客户端同步初始化，确保在任意子组件发起请求前 instance 已存在
  if (typeof window !== "undefined") {
    initHttpClient({
      getToken: () => getUserManager().getToken(),
    });
  }
  return null;
}
