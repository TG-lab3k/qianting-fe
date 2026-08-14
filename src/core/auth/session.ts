import { sanitizeCallbackUrl } from "./config";

const KEY_OAUTH_CALLBACK_URL = "oauth_callback_url";

export function setPendingCallbackUrl(url: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(KEY_OAUTH_CALLBACK_URL, sanitizeCallbackUrl(url));
}

/** 读出并清除；非法或缺失时返回 "/" */
export function consumePendingCallbackUrl(): string {
  if (typeof sessionStorage === "undefined") return "/";
  const raw = sessionStorage.getItem(KEY_OAUTH_CALLBACK_URL);
  sessionStorage.removeItem(KEY_OAUTH_CALLBACK_URL);
  return sanitizeCallbackUrl(raw);
}
