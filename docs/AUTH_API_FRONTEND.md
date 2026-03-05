# 前端登录对接文档

本文档描述前端与后端认证接口的约定，以及本项目的对接实现位置。

## 概述与前置条件

- **后端 Base URL**：优先使用环境变量 `NEXT_PUBLIC_API_BASE`（若已设置）；未设置时，开发环境（`NODE_ENV === 'development'`）默认 `http://localhost:8080`，生产环境默认 `https://api.qianting.xyz`。
- **认证方式**：登录后使用 **JWT access_token**，后续请求在 Header 中携带 `Authorization: Bearer <access_token>`（由 `core/http-client` 统一添加）。
- **前端前置**：用户先通过 **Firebase Auth**（Google Sign-In）在客户端登录，取得 **Firebase ID Token**（id_token），再调用后端 `POST /auth/login` 换取本系统的 access_token 与用户信息。

## 接口定义

### 1. POST /auth/login — 登录

- **请求**：`POST {BASE_URL}/auth/login`，Body `{ "id_token": "<Firebase ID Token>" }`，`Content-Type: application/json`。
- **成功**（HTTP 200，body.code === 0）：`data`: `{ access_token, expires_in, user: { uid, email, display_name, photo_url, provider } }`。
- **错误**：HTTP 200 且 `code === 401`（未传/无效 id_token）或 `code === 503`（服务不可用）。

### 2. POST /auth/logout — 登出

- **请求**：`POST {BASE_URL}/auth/logout`，Header `Authorization: Bearer <access_token>`。
- **成功**：`code === 0`，`message: "ok"`。前端应清除本地 access_token。
- **错误**：HTTP 401 或 503；前端仍应清除本地 token。

### 3. GET /auth/me — 获取当前用户（校验 token）

- **请求**：`GET {BASE_URL}/auth/me`，Header `Authorization: Bearer <access_token>`。
- **成功**：`code === 0`，`data`: `{ uid, email, display_name, photo_url, provider }`。
- **错误**：HTTP 401（未登录或 token 无效/过期）或 503。

## 通用约定

- 业务成功均为 `code === 0`；业务失败可能仍为 HTTP 200 但 `code !== 0`（如 401、503）。
- 收到 HTTP 401/503 时，前端应清除 token 并引导至登录页。

## 本项目实现位置

| 功能           | 位置 |
|----------------|------|
| 类型与 API 封装 | `src/core/auth/`（types.ts, api.ts, storage.ts） |
| Firebase 登录   | `src/core/firebase.ts`，登录页 `src/app/login/page.tsx` |
| Token 持久化   | `localStorage`（多 Tab 共享），读写见 `core/auth/storage.ts`；恢复与校验在 `src/app/HttpClientInit.tsx`（有本地 token 时调用 GET /auth/me 校验并拉取用户信息） |
| 登录态与登出   | `core/user`（UserManager + useUser），首页导航栏展示用户/退出 |

## 错误码

| code | 含义           | 前端建议           |
|------|----------------|--------------------|
| 0    | 成功           | 正常处理           |
| 401  | 未授权/token 无效 | 清 token，跳转登录 |
| 503  | 服务不可用     | 提示稍后重试       |
