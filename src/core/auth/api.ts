import { get, post, type Result } from "@/core/http-client";
import { HARBOR_APP_ID, HARBOR_BASE } from "./config";
import type {
  AuthUser,
  LoginResultData,
  LogoutResData,
  MeResData,
  OAuthAuthorizeData,
  OAuthCallbackReq,
  TokenPairData,
} from "./types";

const AUTH_API = {
  authorize: (provider: string) => `/api/v1/auth/oauth/${provider}/authorize`,
  callback: (provider: string) => `/api/v1/auth/oauth/${provider}/callback`,
  refresh: "/api/v1/auth/refresh",
  logout: "/api/v1/auth/logout",
  me: "/api/v1/user/me",
} as const;

function authCfg() {
  return { baseURL: HARBOR_BASE };
}

/** 获取 Google OAuth 授权页 URL */
export async function oauthAuthorize(
  redirectUri: string,
  provider: string = "google"
): Promise<Result<OAuthAuthorizeData>> {
  return get<OAuthAuthorizeData>(AUTH_API.authorize(provider), {
    ...authCfg(),
    params: {
      app_id: HARBOR_APP_ID,
      redirect_uri: redirectUri,
    },
  });
}

/** 用 authorization code 换取 access + refresh */
export async function oauthCallback(
  code: string,
  redirectUri: string,
  state?: string | null,
  provider: string = "google"
): Promise<Result<LoginResultData>> {
  const body: OAuthCallbackReq = {
    app_id: HARBOR_APP_ID,
    code,
    redirect_uri: redirectUri,
  };
  if (state) body.state = state;
  return post<LoginResultData>(AUTH_API.callback(provider), body, authCfg());
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

export type {
  AuthUser,
  MeResData,
  LogoutResData,
  TokenPairData,
  LoginResultData,
  OAuthAuthorizeData,
};
