# 前端登录对接文档（harbor-services）

本文档描述前端与 **harbor-services** 认证服务的约定，以及本项目的对接实现位置。

## 概述与前置条件

- **认证 Base URL**：`NEXT_PUBLIC_HARBOR_BASE`（默认 `https://harbor.qianting.xyz`），路径前缀 `/api/v1`。
- **业务 Base URL**：`NEXT_PUBLIC_API_BASE`（默认 dev=`http://localhost:8080`，prod=`https://api.qianting.xyz`）。
- **App ID**：`NEXT_PUBLIC_HARBOR_APP_ID`（如 `app_tZUakLxp9g2oSE7m`）。
- **认证方式**：登录后使用 harbor 签发的 **JWT access_token**；业务请求由 `core/http-client` 自动加 `Authorization: Bearer <access_token>`。
- **登录前置**：Google OAuth Authorization Code（整页跳转），回调本站 `/login/callback` 后换取 access + refresh。

## 接口定义（harbor-services）

### 1. GET /api/v1/auth/oauth/:provider/authorize

- `provider`：`google` | `apple`。
- Query：`app_id`、`redirect_uri`（须在应用 `redirect_uris` 白名单内，精确匹配）。
- 成功 `data`：`{ authorize_url, state }`。前端整页跳转 `authorize_url`。

### 2. POST /api/v1/auth/oauth/:provider/callback

- Body：`{ app_id, code, redirect_uri, state? }`（`redirect_uri` 须与 authorize 一致；`state` 来自 Google 回跳 query）。
- 成功 `data`：LoginResult = TokenPair + `user`（`access_token`、`refresh_token`、`token_type`、`expires_in`、`user`）。

### 3. POST /api/v1/auth/refresh

- Body：`{ refresh_token }` → 新的 TokenPair（rotation）。

### 4. POST /api/v1/auth/logout

- Header：`Authorization: Bearer <access_token>`。撤销 refresh 并抬升 `token_version`；前端仍应清除本地凭证。

### 5. GET /api/v1/user/me

- Header：Bearer。成功 `data`：UserPublic（`user_id`、`app_id`、`email`、`nickname`、`avatar_url` 等）。

## 通用约定

- 业务成功均为 `code === 0`；失败可能仍为 HTTP 200 但 `code !== 0`。
- 认证请求通过 http-client 的请求级 `baseURL` 打到 harbor；业务请求仍走默认 `API_BASE`。
- Token 存 **localStorage**：`access_token`、`refresh_token`、`user_name`、`user_avatar`。
- 启动时 `HttpClientInit` 调 me；若 token 失效（1007/401）则尝试 refresh 一次。

## 本项目实现位置

| 功能 | 位置 |
|------|------|
| 配置 / redirect_uri / 错误文案 | `src/core/auth/config.ts` |
| 类型与 API | `src/core/auth/types.ts`、`api.ts` |
| Token 持久化 | `src/core/auth/storage.ts` |
| OAuth 回跳路径暂存 | `src/core/auth/session.ts` |
| 登录发起 | `src/app/login/page.tsx` |
| OAuth 回调 | `src/app/login/callback/page.tsx` |
| 启动恢复 | `src/app/HttpClientInit.tsx` |
| 登录态订阅 | `core/user`（UserManager + useUser） |

## 错误码（节选）

| code | 含义 | 前端建议 |
|------|------|----------|
| 0 | 成功 | 正常处理 |
| 1007 / 401 | Token 无效/过期 | 尝试 refresh；失败则清态并引导登录 |
| 1008 | 三方登录失败 | 回调页提示重试 |
| 2001 | App 不存在/停用 | 提示配置异常 |
| 2006 | redirect_uri 不在白名单 | 提示配置异常（服务端联调修复） |
| 2007 | Provider 未配置 | 提示暂不可用 |
