/** wachi-auth 服务根地址（不含 /api/v1） */
export const WACHI_AUTH_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_WACHI_AUTH_BASE
    ? process.env.NEXT_PUBLIC_WACHI_AUTH_BASE
    : "https://auth.qianting.xyz";

/** qianting 在 wachi-auth 中的 app_id */
export const WACHI_AUTH_APP_ID =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_WACHI_AUTH_APP_ID
    ? process.env.NEXT_PUBLIC_WACHI_AUTH_APP_ID
    : "";

export const OAUTH_CALLBACK_PATH = "/login/callback";

/** 与 authorize / callback 必须使用同一字符串 */
export function getOAuthRedirectUri(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${OAUTH_CALLBACK_PATH}`;
}

/** 仅允许站内相对路径，防止开放重定向 */
export function sanitizeCallbackUrl(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export function mapAuthErrorMessage(errorCode: number, fallback?: string): string {
  switch (errorCode) {
    case 2006:
      return "登录回调地址未授权，请稍后重试或联系管理员";
    case 2007:
      return "Google 登录暂不可用";
    case 1008:
      return "第三方登录失败，请重试";
    case 1007:
    case 401:
      return "登录已失效，请重新登录";
    case 2001:
      return "应用配置异常";
    default:
      return fallback || "登录失败，请重试";
  }
}

export function isAuthExpiredCode(errorCode: number): boolean {
  return errorCode === 1007 || errorCode === 401;
}
