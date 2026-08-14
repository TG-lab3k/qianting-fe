import { get, post, type Result } from "@/core/http-client";
import { WACHI_AUTH_APP_ID, WACHI_AUTH_BASE } from "./config";
import type {
  AuthUser,
  LogoutResData,
  MeResData,
  OAuthAuthorizeData,
  OAuthCallbackReq,
  TokenPairData,
} from "./types";

const AUTH_API = {
  authorize: "/api/v1/auth/oauth/google/authorize",
  callback: "/api/v1/auth/oauth/google/callback",
  refresh: "/api/v1/auth/refresh",
  logout: "/api/v1/auth/logout",
  me: "/api/v1/user/me",
} as const;

function authCfg() {
  return { baseURL: WACHI_AUTH_BASE };
}

/** 获取 Google OAuth 授权页 URL */
export async function oauthAuthorize(
  redirectUri: string
): Promise<Result<OAuthAuthorizeData>> {
  return get<OAuthAuthorizeData>(AUTH_API.authorize, {
    ...authCfg(),
    params: {
      app_id: WACHI_AUTH_APP_ID,
      redirect_uri: redirectUri,
    },
  });
}

/** 用 authorization code 换取 access + refresh */
export async function oauthCallback(
  code: string,
  redirectUri: string
): Promise<Result<TokenPairData>> {
  const body: OAuthCallbackReq = {
    app_id: WACHI_AUTH_APP_ID,
    code,
    redirect_uri: redirectUri,
  };
  return post<TokenPairData>(AUTH_API.callback, body, authCfg());
}

/** 轮换 token 对 */
export async function authRefresh(
  refreshToken: string
): Promise<Result<TokenPairData>> {
  return post<TokenPairData>(
    AUTH_API.refresh,
    { refresh_token: refreshToken },
    authCfg()
  );
}

/** 登出：撤销 refresh；无论成败前端都应清本地态 */
export async function authLogout(): Promise<Result<LogoutResData>> {
  return post<LogoutResData>(AUTH_API.logout, {}, authCfg());
}

/** 获取当前用户并校验 access token */
export async function authMe(): Promise<Result<MeResData>> {
  return get<MeResData>(AUTH_API.me, authCfg());
}

export type { AuthUser, MeResData, LogoutResData, TokenPairData, OAuthAuthorizeData };
