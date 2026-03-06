"use client";

import { useState, useEffect } from "react";
import { getUserManager } from "./index";
import type { UserVo } from "./index";

/** 订阅 UserManager 的登录态，用于在导航栏等处响应登录/登出 */
export function useUser(): UserVo {
  const [user, setUser] = useState<UserVo>(() => getUserManager().getUser());

  useEffect(() => {
    const unsubLogin = getUserManager().onLogin((u) => setUser({ ...u }));
    const unsubLogout = getUserManager().onLogout(() =>
      setUser(getUserManager().getUser())
    );
    return () => {
      unsubLogin();
      unsubLogout();
    };
  }, []);

  return user;
}
