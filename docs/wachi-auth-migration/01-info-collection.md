# Step 1 · 信息收集文档（Google 登录 → wachi-auth 迁移）

> 状态：**已确认并补充**（产品声明 redirect_uris 已配置；进入 Step 2）  
> 补充：`https://qianting.xyz/login/callback` 已声明写入 wachi-auth app `redirect_uris`（2026-08-31）  
> 需求来源：`prd_login.md`  
> 外部文档：`~/workspace/okok/wachi-auth/README.md`、`README_API.md`  
> 目标：将 qianting-fe 中现有的 Google 登录（Firebase Auth + qianting `/auth/*`）替换为 **wachi-auth** 统一认证服务。

---

## 1. 需求摘要（来自 PRD）

| 项 | 内容 |
|----|------|
| 诉求 | 用 wachi-auth 替换当前 Google 登录 |
| 认证服务 | 项目 `wachi-auth`（路径 `~/workspace/okok/wachi-auth`） |
| 生产 Base | `https://auth.qianting.xyz` |
| App ID | `app_zHlN4VrsJHKhM77g` |
| Google Client ID | `918258037438-atnd98fe2lt9m06tsa5ta1911jm7olei.apps.googleusercontent.com`（**仅服务端/wachi-auth 使用，禁止进前端**） |
| Google Client Secret | PRD 已给出（**仅服务端，禁止进前端仓库/环境变量**） |
| 声明的 redirect_uri | `https://qianting.xyz/login/callback` |

本次改动主体在 **qianting-fe**；业务 API 仍走 qianting 后端（`api.qianting.xyz`），认证 API 改走 wachi-auth。

---

## 2. 现状梳理（qianting-fe）

### 2.1 技术栈

Next.js 16（App Router）· React 19 · TS 5 · React Compiler · Axios `http-client` · **Firebase Auth（popup）** · Tailwind v4 + shadcn 风格组件。

### 2.2 现有认证链路（Firebase）

```
[登录页 /login]
  signInWithGoogle()          ← Firebase signInWithPopup
  → getIdToken(user)          ← Firebase ID Token
  → authLogin(idToken)        ← POST {API_BASE}/auth/login { id_token }
  → { access_token, user{uid,email,display_name,photo_url,provider} }
  → saveAuthToStorage(localStorage) + UserManager.login(...)
  → 后续业务请求由 http-client 自动带 Authorization: Bearer <access_token>
```

启动恢复（`HttpClientInit`）：有本地 token → `GET /auth/me` 校验 → 成功更新用户信息，失败清登录态。

登出（`home/page.tsx`）：`authLogout()` → `POST /auth/logout` → 清 storage + `UserManager.logout()`。

### 2.3 关键文件与职责

| 文件 | 职责 |
|------|------|
| `src/core/firebase.ts` | Firebase 初始化、`signInWithGoogle()`、`getIdToken()` |
| `src/core/auth/api.ts` | `authLogin` / `authMe` / `authLogout` → qianting `/auth/*` |
| `src/core/auth/types.ts` | `AuthUser{uid,email,display_name,photo_url,provider}`、`LoginReq{id_token}` |
| `src/core/auth/storage.ts` | **localStorage** 存 `access_token` / `user_name` / `user_avatar`（仅单 token，无 refresh） |
| `src/core/user/index.ts` | `UserManager` 单例（token / name / avatar） |
| `src/core/user/useUser.ts` | React 订阅登录态 |
| `src/core/http-client/index.ts` | Axios 单例，`API_BASE` 默认业务后端，Bearer 注入，`Result<T>` |
| `src/app/login/page.tsx` | Google 按钮 → Firebase 弹窗流程 |
| `src/app/HttpClientInit.tsx` | 恢复 token + `authMe` 校验 |
| `src/app/home/page.tsx` | 展示用户、登出、调用 `/analyze` |
| **不存在** | `/login/callback` 路由 |

> 文档/规则里写 sessionStorage 的地方与代码不一致；**以代码为准：localStorage**。

### 2.4 现有环境变量（`.env.example`）

- `NEXT_PUBLIC_FIREBASE_*`（apiKey / authDomain / projectId / storageBucket / messagingSenderId / appId）
- `NEXT_PUBLIC_API_BASE`（可选；默认 dev=`http://localhost:8080`，prod=`https://api.qianting.xyz`）

依赖：`package.json` 含 `firebase@^12.10.0`。

### 2.5 现有后端契约（qianting 业务后端，本仓库外）

| 接口 | 说明 |
|------|------|
| `POST /auth/login` | 用 Firebase `id_token` 换本系统 `access_token` |
| `GET /auth/me` | 校验 token，返回用户 |
| `POST /auth/logout` | 使 token 失效 |
| `GET /analyze?ticker=` | 业务接口，需 `Authorization: Bearer <access_token>` |

当前 `access_token` 由 **qianting 后端基于 Firebase id_token 换发**，与 wachi-auth JWT **不是同一套**。

---

## 3. 目标服务梳理（wachi-auth）

### 3.1 服务画像

- 统一用户认证 SaaS（FastAPI）：邮箱、Google OAuth、Apple、JWT 双令牌、多应用隔离。
- **BYO Client**：每个 `app_id` 自带 Google/Apple OAuth 凭证；OAuth `redirect_uri` 须在该 app 的 `redirect_uris` 白名单内（精确匹配，失败码 `2006`；未配置 provider 为 `2007`）。
- 统一响应：`{ code, message, data, request_id }`，`code === 0` 成功。

### 3.2 本需求相关接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/auth/oauth/{provider}/authorize` | GET | Query：`app_id`、`redirect_uri` → `{ authorization_url }` |
| `/api/v1/auth/oauth/{provider}/callback` | POST | Body：`{ app_id, code, redirect_uri }` → access + refresh |
| `/api/v1/auth/refresh` | POST | Body：`{ refresh_token }` → 轮换新 token 对 |
| `/api/v1/auth/logout` | POST | Bearer，撤销所有 refresh_token |
| `/api/v1/user/me` | GET | Bearer → `{ user_id, app_id, email, nickname, avatar_url, ... }` |

`provider` = `google`。登录成功响应含：`user_id`、`email`、`nickname`、`access_token`、`refresh_token`、`token_type`、`expires_in` 等。

### 3.3 OAuth 流程（重定向，非弹窗）

```
1. GET  authorize?app_id=&redirect_uri=  → { authorization_url }
2. 浏览器整页跳转 authorization_url     → 用户在 Google 授权
3. Google 回调 redirect_uri?code=...    → 前端 /login/callback 取 code
4. POST callback { app_id, code, redirect_uri }
   → access_token + refresh_token → 存本地 → 跳转业务页
```

约束：

- authorize 与 callback 的 **`redirect_uri` 必须完全一致**（Google code 兑换同理）。
- 首次 OAuth 自动建用户（`active`）；email 已存在则自动绑定。
- access ≈ 2h，refresh ≈ 30d（rotation + 盗用检测）。

### 3.4 生产环境实测（2026-08-31）

| 探测 | 结果 |
|------|------|
| `GET https://auth.qianting.xyz/health` | ✅ `healthy` / WachiAuth 1.0.0 |
| OpenAPI 含 oauth/refresh/logout/user/me | ✅ |
| `app_id=app_zHlN4VrsJHKhM77g` | ✅ 存在（错误 app 返回 `2001`，本 app 不返回 `2001`） |
| `authorize` + `redirect_uri=https://qianting.xyz/login/callback` | ❌ **`2006 Redirect URI not allowed for this app`** |
| 同上 + `localhost:3000` / `www.` / 尾斜杠变体 | ❌ 均为 `2006` |

结论：

- 服务可用、应用存在；Google provider **大概率已配置**（否则倾向 `2007`）。
- **PRD 声明的 redirect_uri 尚未写入该 app 的 `redirect_uris` 白名单**（或与库中配置不一致）。这是上线前必须由运维/管理端补齐的阻塞项。

---

## 4. 现状 vs 目标 · 差异

| 维度 | 现状（Firebase） | 目标（wachi-auth） |
|------|------------------|--------------------|
| 登录 UX | 弹窗，无跳转 | 整页跳转 Google + 回调页 |
| 前端凭证 | Firebase ID Token | wachi-auth access + refresh |
| 换 token | `POST {API_BASE}/auth/login` | 不需要；callback 直接发 JWT |
| 用户字段 | `uid` / `display_name` / `photo_url` | `user_id` / `nickname` / `avatar_url` |
| Token 存储 | 仅 access | access + refresh |
| 续期 | 无前端 refresh | `POST /auth/refresh` |
| 回调路由 | 无 | 需 `/login/callback` |
| me / logout | qianting `/auth/me`、`/auth/logout` | wachi-auth `/user/me`、`/auth/logout` |
| HTTP Base | 单一 `API_BASE` | **双 Base**：认证 host ≠ 业务 host |

### 双后端（关键）

| 用途 | Base | 示例 |
|------|------|------|
| 认证 | `https://auth.qianting.xyz` | `/api/v1/auth/oauth/...`、`/api/v1/user/me` |
| 业务 | `https://api.qianting.xyz`（或 `NEXT_PUBLIC_API_BASE`） | `/analyze` |

业务请求仍带同一 wachi-auth `access_token`（前提：qianting 后端已改为校验该 JWT）。

---

## 5. 初步改造范围（供 Step 2/3 细化）

1. 新增 wachi-auth 客户端（authorize / callback / refresh / logout / me），独立于业务 `API_BASE`。
2. 新增路由 `src/app/login/callback/page.tsx`：读 `code` → callback → 存双 token → 跳转。
3. 改造 `storage.ts`：持久化 access + refresh；映射用户展示字段。
4. 改造 `HttpClientInit`：恢复登录态；access 失效时 refresh；仍失败则清态。
5. 改造 `login/page.tsx`：Google 按钮改为拉 `authorization_url` 后整页跳转。
6. 改造 `home` 登出：调 wachi-auth logout。
7. 移除 Firebase：`firebase.ts`、依赖、`NEXT_PUBLIC_FIREBASE_*`。
8. 环境变量：`NEXT_PUBLIC_WACHI_AUTH_BASE`、`NEXT_PUBLIC_WACHI_AUTH_APP_ID`。
9. 更新 `AGENTS.md`、`docs/AUTH_API_FRONTEND.md`、`docs/TECH_ARCHITECTURE.md`、`.cursor/rules/auth-and-user.mdc`。

**不在本次范围（除非后续确认）：** 邮箱密码登录、Apple、OAuth link/unlink、管理端创建 app。

---

## 6. 假设与待确认事项

| # | 事项 | 建议默认 | 需你确认 |
|---|------|----------|----------|
| A | qianting 业务后端 `/analyze` 等是否已/将同步校验 **wachi-auth JWT** | 是（否则业务 401，前端改完也无法用） | ✅ / ❌ / 排期 |
| B | 登录范围是否 **仅 Google**（不做邮箱密码） | 仅 Google | ✅ / ❌ |
| C | 生产回调固定为 `https://qianting.xyz/login/callback`；本地开发是否另加 `http://localhost:3000/login/callback` 到白名单 | 生产按 PRD；本地建议同步加 | 本地 URI 是否加白名单 |
| D | `redirect_uris` 当前 `2006`：是否由运维尽快 PATCH app 写入 PRD 中的 URI | 必须，阻塞联调 | 负责人 / ETA |
| E | Google Cloud「Authorized redirect URIs」是否已含同一回调地址 | 必须与 authorize 使用的 URI 一致 | 确认 |
| F | 前端是否实现 refresh 自动续期 | 建议实现（access 仅约 2h） | ✅ / ❌ |
| G | `callbackUrl`（登录前业务回跳）在 OAuth 整页跳转后如何保留 | 建议 callback 前写入 `sessionStorage`，回调成功后再 `replace` | 或其它方案 |

---

## 7. 需要补充的外部资源 / 配置清单

### 7.1 wachi-auth 服务侧（阻塞项标 ★）

- [x] 生产实例可用：`https://auth.qianting.xyz`（health 已通过）
- [x] App 已创建：`app_zHlN4VrsJHKhM77g`（实测存在）
- [ ] ★ 将该 app 的 `redirect_uris` **实际写入**至少：
  - `https://qianting.xyz/login/callback`
  - （建议）`http://localhost:3000/login/callback`
- [ ] 确认该 app 已配置 Google Client ID/Secret（BYO；PRD 已给凭证，需确认已落库且生效）
- [ ] （可选）本地联调：本机 `docker compose` 起一套 wachi-auth，或继续打生产

### 7.2 Google Cloud OAuth Client

- [ ] ★ Authorized redirect URIs 包含与前端一致的回调（至少生产 `https://qianting.xyz/login/callback`）
- [ ] 确认 Client ID 与 wachi-auth 中该 app 配置一致  
- **注意**：Client Secret **不得**写入 qianting-fe 任何环境变量或前端代码。

### 7.3 qianting 业务后端

- [ ] ★ 确认 `/analyze`（及后续需登录接口）校验 **wachi-auth** 签发的 JWT（密钥/issuer/`app_id` 约定与 wachi-auth 对齐）
- [ ] 旧 Firebase `/auth/login|me|logout` 可废弃或下线（前端将不再调用）

### 7.4 前端环境变量（实施时新增）

| 变量 | 示例值 | 说明 |
|------|--------|------|
| `NEXT_PUBLIC_WACHI_AUTH_BASE` | `https://auth.qianting.xyz` | 认证服务根；请求路径再拼 `/api/v1/...` |
| `NEXT_PUBLIC_WACHI_AUTH_APP_ID` | `app_zHlN4VrsJHKhM77g` | 多租户 app id |
| `NEXT_PUBLIC_API_BASE` | `https://api.qianting.xyz` | 业务后端（可沿用） |

回调路径建议常量 `/login/callback`；绝对地址用 `window.location.origin + '/login/callback'`（生产域名须已在白名单）。

### 7.5 文档与密钥卫生

- [ ] PRD / 聊天记录中的 Google Client Secret 勿提交到公开仓库；若已泄露应旋转
- [ ] 迁移完成后更新：`AUTH_API_FRONTEND.md`、`TECH_ARCHITECTURE.md`、`AGENTS.md`、auth 相关 cursor rules

---

## 8. 信息来源索引

| 来源 | 用途 |
|------|------|
| `prd_login.md` | 需求与生产配置声明 |
| `~/workspace/okok/wachi-auth/README.md` / `README_API.md` | 服务能力与 API 契约 |
| `src/core/auth/*`、`firebase.ts`、`login/page.tsx`、`HttpClientInit.tsx` | 现状实现 |
| `docs/AUTH_API_FRONTEND.md`、`docs/TECH_ARCHITECTURE.md` | 旧契约文档（待废止/改写） |
| 生产探测 `auth.qianting.xyz` | 可用性与 redirect_uri 缺口验证 |

---

## 9. 本步结论（请确认）

1. **需求清晰**：前端 Google 登录从 Firebase 弹窗改为 wachi-auth OAuth 重定向 + 回调换 token。  
2. **生产认证服务与 app_id 已就绪**；**redirect_uri 白名单未生效（2006）是当前最大外部阻塞**。  
3. **必须双 HTTP Base**（auth vs api）；前端需存 **双 token** 并建议做 **refresh**。  
4. **Google 密钥只留在 wachi-auth**，前端只持有 Base URL + app_id。  
5. 进入 Step 2 前，请确认 **§6 待确认事项 A–G**（尤其 A 业务 JWT、C/D redirect 白名单、F refresh）。

确认本信息收集文档后，再输出 **Step 2 · 详细需求文档**。
