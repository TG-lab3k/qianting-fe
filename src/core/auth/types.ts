/** POST refresh 成功时 data；OAuth/login 的 token 字段同此 */
export interface TokenPairData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

/** OAuth callback / email login 成功时 data（TokenPair + user） */
export interface LoginResultData extends TokenPairData {
  user: AuthUser;
}

export interface OAuthAuthorizeData {
  authorize_url: string;
  state: string;
}

export interface OAuthCallbackReq {
  app_id: string;
  code?: string;
  id_token?: string;
  redirect_uri: string;
  state?: string;
}

export interface RefreshReq {
  refresh_token: string;
}

/** GET /api/v1/user/me · LoginResult.user */
export interface AuthUser {
  user_id: string;
  app_id: string;
  email: string | null;
  email_verified?: boolean;
  nickname: string | null;
  avatar_url: string | null;
  phone?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string | null;
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

export function displayFromLoginResult(d: LoginResultData): {
  name: string;
  avatar: string;
} {
  if (d.user) return displayFromAuthUser(d.user);
  return { name: "", avatar: "" };
}
