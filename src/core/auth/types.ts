/** OAuth callback / refresh 成功时 data */
export interface TokenPairData {
  user_id: string;
  email: string | null;
  nickname: string | null;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface OAuthAuthorizeData {
  provider: string;
  authorization_url: string;
}

export interface OAuthCallbackReq {
  app_id: string;
  code: string;
  redirect_uri: string;
}

export interface RefreshReq {
  refresh_token: string;
}

/** GET /api/v1/user/me */
export interface AuthUser {
  user_id: string;
  app_id: string;
  email: string | null;
  email_verified?: boolean;
  nickname: string | null;
  avatar_url: string | null;
  status?: string;
  linked_providers?: string[];
}

export type MeResData = AuthUser;

export interface LogoutResData {
  message?: string;
}

export function displayFromAuthUser(
  u: Pick<AuthUser, "nickname" | "email" | "avatar_url">
): { name: string; avatar: string } {
  return {
    name: u.nickname ?? u.email ?? "",
    avatar: u.avatar_url ?? "",
  };
}

/** callback 响应通常无头像，先空 avatar */
export function displayFromTokenPair(d: TokenPairData): { name: string; avatar: string } {
  return {
    name: d.nickname ?? d.email ?? "",
    avatar: "",
  };
}
