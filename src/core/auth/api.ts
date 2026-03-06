import { get, post, type Result } from "@/core/http-client";
import type {
  AuthUser,
  LoginReq,
  LoginResData,
  MeResData,
  LogoutResData,
} from "./types";

/**
 * 使用 Firebase id_token 调用后端登录，换取 access_token 与用户信息。
 * 请求不带 Authorization，登录成功后由业务层保存 token 并调用 UserManager.login。
 */
export async function authLogin(idToken: string): Promise<Result<LoginResData>> {
  const body: LoginReq = { id_token: idToken };
  return post<LoginResData>("/auth/login", body);
}

/**
 * 登出：使当前 token 失效。请求会通过 http-client 自动携带 Authorization。
 * 无论成功或 401，前端都应清除本地 token 并调用 UserManager.logout。
 */
export async function authLogout(): Promise<Result<LogoutResData>> {
  return post<LogoutResData>("/auth/logout", {});
}

/**
 * 获取当前用户并校验 token。用于应用启动或路由切换时恢复/校验登录态。
 * 请求会通过 http-client 自动携带 Authorization。
 */
export async function authMe(): Promise<Result<MeResData>> {
  return get<MeResData>("/auth/me");
}

export type { AuthUser, LoginResData, MeResData, LogoutResData };
