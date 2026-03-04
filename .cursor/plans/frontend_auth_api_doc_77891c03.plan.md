---
name: Frontend Auth API doc
overview: 根据 server.py 中的 POST /auth/login、POST /auth/logout、GET /auth/me 及鉴权约定，生成一份面向前端开发的对接需求文档，便于前端直接实现登录、登出与 token 校验并生成代码。
todos: []
isProject: false
---

# 前端登录对接需求文档 — 编写计划

## 目标

在项目根目录新增一份**前端可单独使用的对接文档**（建议文件名 `docs/AUTH_API_FRONTEND.md` 或 `AUTH_API_FRONTEND.md`），包含：接口契约、请求/响应示例、前端流程、错误码、以及可直接用于生成请求代码的说明（如 TypeScript 类型或示例调用）。前端仅凭该文档即可对接登录、登出与 token 校验，无需阅读后端源码。

---

## 文档应包含的内容

### 1. 概述与前置条件

- **后端 Base URL**：由部署决定（如 `https://quant-service-xxx.run.app` 或通过网关如 `/api`）；文档中用占位符 `BASE_URL`，前端替换为实际地址。
- **认证方式**：登录后使用 **JWT access_token**，后续请求在 Header 中携带 `Authorization: Bearer <access_token>`。
- **前端前置**：用户需先通过 **Firebase Auth**（如 Google Sign-In）在客户端完成登录，取得 **Firebase ID Token**（id_token），再调用后端 `/auth/login` 换取本系统的 access_token 与用户信息。文档中明确「前端需集成 Firebase Auth SDK，拿到 id_token 后调后端」。

### 2. 接口定义（与 server.py 一致）

**2.1 POST /auth/login — 登录**

- **请求**
  - Method: `POST`
  - URL: `{BASE_URL}/auth/login`
  - Headers: `Content-Type: application/json`
  - Body (JSON): `{ "id_token": "<Firebase ID Token 字符串>" }`
- **成功响应**（HTTP 200）
  - Body: `{ "code": 0, "data": { "access_token": string, "expires_in": number, "user": { "uid": string, "email": string | null, "display_name": string | null, "photo_url": string | null, "provider": string } } }`
  - 说明：`expires_in` 为秒；前端应持久化 `access_token`（见下文），并在需要登录态的请求中携带。
- **错误响应**
  - HTTP 200 + `{ "code": 401, "message": "Missing id_token" }` 或 `"Unauthorized"`：未传 id_token 或 token 无效。
  - HTTP 200 + `{ "code": 503, "message": "Service unavailable" }`：后端依赖不可用。
- **示例**：给出 curl 与简单 fetch/axios 示例（Body 为 JSON）。

**2.2 POST /auth/logout — 登出**

- **请求**
  - Method: `POST`
  - URL: `{BASE_URL}/auth/logout`
  - Headers: `Authorization: Bearer <access_token>`
- **成功响应**（HTTP 200）
  - Body: `{ "code": 0, "message": "ok" }`
  - 说明：调用后该 token 失效，前端应清除本地存储的 access_token。
- **错误响应**
  - HTTP 401：未带 token 或 token 无效/已失效。
  - HTTP 503：后端不可用。

**2.3 GET /auth/me — 获取当前用户（校验 token）**

- **请求**
  - Method: `GET`
  - URL: `{BASE_URL}/auth/me`
  - Headers: `Authorization: Bearer <access_token>`
- **成功响应**（HTTP 200）
  - Body: `{ "code": 0, "data": { "user": { ... } } }`，`user` 结构与登录返回的 `data.user` 一致（含 uid、email、display_name、photo_url、provider 等）。
  - 说明：用于应用启动或路由切换时校验登录态、拉取当前用户信息；后端会做滑动过期（不影响前端，前端无需换 token）。
- **错误响应**
  - HTTP 401：未登录或 token 无效/过期，前端应跳转登录或清 token。
  - HTTP 503：后端不可用。

### 3. 通用约定

- **响应体**：业务成功均为 `code: 0`；业务失败（如未授权）可能仍为 HTTP 200，但 `code !== 0`（如 401、503），前端需同时判断 `code`。
- **HTTP 状态码**：部分错误由后端返回 401/503，此时 body 可能为 `{"detail": "Unauthorized"}` 等；文档中注明「若收到 401/503，应清 token 并引导登录」。
- **CORS**：后端已配置 CORS，支持浏览器跨域请求；若通过网关转发，需确保网关也放行相应 Method 与 Headers（如 `Authorization`）。

### 4. 前端流程与实现要点

- **登录流程**：  
1）使用 Firebase Auth（如 `signInWithPopup(googleProvider)` 或 Apple/Twitter）登录；  
2）从 `User.getIdToken()` 取得 id_token；  
3）请求 `POST /auth/login`，Body `{ id_token }`；  
4）若 `code === 0`，保存 `data.access_token`（及可选 `data.user`、`data.expires_in`）；  
5）跳转至应用首页或目标页。
- **登出流程**：  
1）若有 token，调用 `POST /auth/logout`（Header 带 Bearer token）；  
2）无论成功或 401，前端均清除本地 access_token；  
3）可选：调用 Firebase `signOut()`。
- **Token 校验与携带**：  
  - 应用初始化或进入需登录页时，可调 `GET /auth/me` 校验 token 并获取当前用户；  
  - 所有需登录态的后端请求，Header 统一添加 `Authorization: Bearer ${access_token}`。
- **Token 存储**：建议使用内存 + 持久化（如 sessionStorage 或 httpOnly Cookie，由后端 Set-Cookie 需后端配合）；文档中说明「至少将 access_token 持久化到 sessionStorage 或 localStorage，并注明 XSS 风险与推荐做法（如 httpOnly Cookie）」。

### 5. TypeScript 类型与请求示例（便于生成代码）

- 定义接口请求/响应类型（如 `LoginReq`、`LoginRes`、`User`、`LogoutRes`、`MeRes`），与上述 JSON 结构一致。
- 提供一段「请求封装示例」：如 `authLogin(id_token)`、`authLogout()`、`authMe()`，使用 fetch 或 axios，并处理 401/503 与 `code !== 0`。

### 6. 错误码汇总表

- 列出 `code` 与含义：0 成功，401 未授权/ token 无效，503 服务不可用；以及 HTTP 401/503 时的处理建议。

### 7. 文件位置与格式

- **路径**：建议 `docs/AUTH_API_FRONTEND.md`（若项目无 `docs` 则用根目录 `AUTH_API_FRONTEND.md`）。
- **格式**：Markdown，含标题、表格、代码块；便于导出或粘贴到内部文档/ Confluence。

---

## 实施步骤

1. 确认文档路径（`docs/AUTH_API_FRONTEND.md` 或根目录 `AUTH_API_FRONTEND.md`）；若选 `docs/` 需确保目录存在。
2. 按上述结构撰写完整 Markdown 文档，请求/响应与 [server.py](server.py) 中实现严格一致（LoginBody、返回值字段、401/503 行为）。
3. 文档中不包含后端实现细节（如 Firestore、JWT 密钥），仅描述前端可见的接口与行为。

完成后的文档可直接交给前端用于对接与代码生成，无需再查后端代码。