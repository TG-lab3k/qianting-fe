/**
 * 与后端 AUTH_API 约定一致的请求/响应类型（见 docs/AUTH_API_FRONTEND.md）
 */

/** 后端返回的用户信息（/auth/login、/auth/me） */
export interface AuthUser {
  uid: string;
  email: string | null;
  display_name: string | null;
  photo_url: string | null;
  provider: string;
}

/** POST /auth/login 请求体 */
export interface LoginReq {
  id_token: string;
}

/** POST /auth/login 成功时 data 字段 */
export interface LoginResData {
  access_token: string;
  expires_in: number;
  user: AuthUser;
}

/** GET /auth/me 成功时 data 字段 */
export interface MeResData {
  user: AuthUser;
}

/** POST /auth/logout 成功时无 data 或 message（后端返回 code:0, message:"ok"） */
export interface LogoutResData {
  message?: string;
}
