"use client";

import { useEffect } from "react";
import { getUserManager } from "@/core/user";
import { initHttpClient } from "@/core/http-client";
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
        const preview = displayFromAuthUser({
          nickname: refreshed.data.nickname,
          email: refreshed.data.email,
          avatar_url: null,
        });
        saveAuthToStorage(
          access,
          refresh,
          stored?.name || preview.name,
          stored?.avatar || preview.avatar
        );
        getUserManager().login({
          token: access,
          name: stored?.name || preview.name,
          avatar: stored?.avatar || preview.avatar,
        });
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
  }, []);

  if (typeof window !== "undefined") {
    initHttpClient({
      getToken: () => getUserManager().getToken(),
    });
  }
  return null;
}
