"use client";

import { useEffect } from "react";
import { getUserManager } from "@/core/user";
import { initHttpClient } from "@/core/http-client";

/**
 * 在应用入口初始化 http-client：从 UserManager 读取 token，
 * 使所有请求自动带上 Authorization header。
 */
export function HttpClientInit() {
  useEffect(() => {
    getUserManager();
    initHttpClient({
      getToken: () => getUserManager().getToken(),
    });
  }, []);
  return null;
}
