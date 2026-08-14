# Step 2 · 详细需求文档（Google 登录 → wachi-auth）

> 状态：**已确认**（redirect_uri 默认通过；`2006` 交由 wachi-auth 联调修复）  
> 前置：[`01-info-collection.md`](./01-info-collection.md)  
> 后续：[`03-tech-design.md`](./03-tech-design.md)  
> 需求来源：`prd_login.md` + Step 1 结论 + 产品补充（redirect_uris 已配置声明）

---

## 1. 背景与目标

### 1.1 背景

qianting-fe 当前通过 **Firebase Auth 弹窗** 取得 Google ID Token，再调用 qianting 业务后端 `POST /auth/login` 换发本系统 token。现需切换到独立认证服务 **wachi-auth**，由该服务完成 Google OAuth 并签发 JWT。

### 1.2 目标（Done Definition）

用户在 qianting 前端点击「使用 Google 登录」后：

1. 跳转 Google 授权；
2. 回到本站 `/login/callback`；
3. 完成登录并进入业务页；
4. 业务请求（如 `/analyze`）携带 wachi-auth 签发的 `access_token` 可正常鉴权；
5. 刷新页面后登录态可恢复；access 过期后可通过 refresh 续期；
6. 登出后本地凭证清除，服务端 refresh 失效；
7. 前端不再依赖 Firebase。

### 1.3 非目标（本需求不做）

- 邮箱密码注册/登录、Apple Sign In、OAuth 账号绑定/解绑 UI
- wachi-auth 管理端、创建 app、配置 Google 凭证的运维操作（视为外部前置）
- 改造 qianting 业务后端代码（本仓库为前端；后端 JWT 校验为外部依赖）
- 登录页视觉大改版（保持现有布局与文案结构，仅改登录行为）

---

## 2. 已确认前提与约束

| 项 | 结论 |
|----|------|
| 认证 Base | `https://auth.qianting.xyz`（可用 env 覆盖） |
| App ID | `app_zHlN4VrsJHKhM77g` |
| 登录方式 | **仅 Google** |
| 生产回调 | `https://qianting.xyz/login/callback`（无尾斜杠、无空格） |
| Google Client Secret | **仅存 wachi-auth**，禁止进入前端 |
| 业务 Base | 继续 `NEXT_PUBLIC_API_BASE` / 默认 `https://api.qianting.xyz` |
| Token 策略 | 存 access + refresh；前端实现 refresh 续期 |
| 业务 JWT | **假设** qianting 后端已/将校验 wachi-auth JWT（若未就绪，登录成功但分析仍 401，需后端跟进） |

### 2.1 外部配置状态（联调依赖）

| 项 | 产品声明 | 前端实测（撰写本文档时） |
|----|----------|--------------------------|
| wachi-auth `redirect_uris` 含 `https://qianting.xyz/login/callback` | 已添加；**前端默认视为通过** | ⚠ 实测曾 `2006`，**交由 wachi-auth 联调修复** |
| Google Console Authorized redirect URIs | 需与上式完全一致 | 未由前端侧验证 |
| 本地 `http://localhost:3000/login/callback` | 建议添加 | 实测亦为 `2006` |

**精确匹配规则（wachi-auth）：** `redirect_uri not in app.redirect_uris` 即失败。前后空格、`http/https`、端口、路径、尾斜杠任一不同都会 `2006`。

> 实施与联调前需复测 `GET .../oauth/google/authorize?app_id=...&redirect_uri=https://qianting.xyz/login/callback` 返回 `code===0`。若仍 `2006`，用管理端 `GET/PUT /admin/apps/{app_id}` 核对库内实际字符串列表。

---

## 3. 用户故事与验收标准

### US-1 · Google 登录（主流程）

**作为**未登录用户，**我希望**用 Google 账号登录，**以便**使用分析等需登录功能。

**主流程：**

1. 访问 `/login`（可带 `?callbackUrl=/` 等）。
2. 点击「使用 Google 登录」。
3. 前端请求 wachi-auth authorize，拿到 `authorization_url` 后整页跳转。
4. 用户在 Google 完成授权。
5. 浏览器落到 `/login/callback?code=...`（及可能的 `state` 等 query）。
6. 前端用 `code` + 同一 `redirect_uri` + `app_id` 调 callback，取得 token 与用户信息。
7. 持久化凭证与展示名/头像，进入 `callbackUrl`（默认 `/`）。

**验收：**

- [ ] 生产域名下可完成一次完整 Google 登录并进入首页。
- [ ] 导航栏显示 nickname（或 email）与 avatar（若有）。
- [ ] 不再出现 Firebase 弹窗；Network 中无 Firebase Auth 请求。
- [ ] 登录相关请求打到 `auth.qianting.xyz`，业务请求仍打到业务 API host。

### US-2 · 登录失败与取消

**验收：**

- [ ] 用户取消 Google 授权或回调无 `code`：回调页提示失败，可返回登录页重试。
- [ ] authorize / callback 业务错误（如 `2006`/`2007`/`1008`）：展示可读错误，不写入半残登录态。
- [ ] 网络失败：提示重试，不清除既有有效登录态（若原本未登录则保持未登录）。

### US-3 · 启动恢复与 token 续期

**验收：**

- [ ] 刷新页面后仍保持登录（localStorage 恢复）。
- [ ] 有 access 时启动调用 `GET /api/v1/user/me` 校验并刷新展示信息。
- [ ] access 失效（如 code `1007` 或 HTTP 401）且存在 refresh：自动 `POST /auth/refresh`，成功则更新双 token 并重试 me；refresh 失败则清登录态。
- [ ] 无 token 时不发起 me/refresh。

### US-4 · 登出

**验收：**

- [ ] 点击退出 → 调 wachi-auth `POST /api/v1/auth/logout`（带 Bearer）→ 无论成功失败都清除本地 access/refresh 与 UserManager。
- [ ] 登出后业务接口不再带旧 token；再次分析提示需登录。

### US-5 · 登录回跳（callbackUrl）

**验收：**

- [ ] `/login?callbackUrl=/some-path` 发起 OAuth 前保存回跳目标；回调成功后进入该路径（须为站内相对路径，防开放重定向）。
- [ ] 未传或非法 `callbackUrl` 时回跳 `/`。

### US-6 · 卸载 Firebase

**验收：**

- [ ] 移除 `src/core/firebase.ts`、`firebase` 依赖、`NEXT_PUBLIC_FIREBASE_*`。
- [ ] `.env.example` / 文档 / cursor rules 与现状一致，不再描述 Firebase 登录。

---

## 4. 功能需求明细

### 4.1 登录页 `/login`

| ID | 需求 |
|----|------|
| FR-1 | 保留现有 UI 结构；主按钮仍为「使用 Google 登录」。 |
| FR-2 | 点击后：计算 `redirect_uri = origin + '/login/callback'`；调用 authorize；`window.location.assign(authorization_url)`。 |
| FR-3 | 跳转前将 `callbackUrl`（校验后）写入 `sessionStorage`。 |
| FR-4 | 加载中禁用按钮；authorize 失败展示错误，不跳转。 |

### 4.2 回调页 `/login/callback`（新建）

| ID | 需求 |
|----|------|
| FR-5 | 客户端页：读取 `code`；缺失则展示错误 + 链到 `/login`。 |
| FR-6 | `POST .../oauth/google/callback`，body：`{ app_id, code, redirect_uri }`，`redirect_uri` 与 authorize 时一致。 |
| FR-7 | 成功：保存 access、refresh、展示用 name/avatar；`UserManager.login`；读取并清除已存 `callbackUrl`；`router.replace`。 |
| FR-8 | 失败：不清成功态写入；展示错误；提供回登录。 |
| FR-9 | 展示简短「登录处理中…」避免白屏。 |

### 4.3 认证 API 封装

| ID | 需求 |
|----|------|
| FR-10 | 封装：`oauthAuthorize`、`oauthCallback`、`authRefresh`、`authLogout`、`authMe`，全部指向 wachi-auth。 |
| FR-11 | **删除**对 qianting `POST /auth/login`（Firebase id_token）的调用与类型。 |
| FR-12 | 认证请求使用独立 Base（不可默认打到业务 `API_BASE`）。 |
| FR-13 | 响应按 `{ code, message, data }` 转 `Result<T>`（与现有 http-client 约定一致）。 |

### 4.4 存储与用户态

| ID | 需求 |
|----|------|
| FR-14 | localStorage 增加 `refresh_token`；登录写双 token，登出双清。 |
| FR-15 | 展示字段映射：`name = nickname ?? email ?? ''`，`avatar = avatar_url ?? ''`。 |
| FR-16 | `UserManager` 对外仍以 token/name/avatar 为主（可仅内存持有 access；refresh 以 storage 为准亦可）。 |

### 4.5 HttpClientInit / 运行时

| ID | 需求 |
|----|------|
| FR-17 | 启动：恢复 token → 初始化业务 http-client 的 `getToken` → 有 token 则 `authMe`。 |
| FR-18 | me 因 token 失效失败时尝试 refresh 一次，再决定保留或登出。 |
| FR-19 | 业务请求继续走现有 `API_BASE`；认证请求不污染业务 baseURL。 |

### 4.6 首页登出与业务

| ID | 需求 |
|----|------|
| FR-20 | `handleLogout` 改为调 wachi-auth logout + 清本地。 |
| FR-21 | `/analyze` 等调用方式不变，仅 Bearer 变为 wachi-auth access_token。 |

### 4.7 配置与文档

| ID | 需求 |
|----|------|
| FR-22 | 新增 env：`NEXT_PUBLIC_WACHI_AUTH_BASE`、`NEXT_PUBLIC_WACHI_AUTH_APP_ID`；更新 `.env.example`。 |
| FR-23 | 更新 `docs/AUTH_API_FRONTEND.md`、`docs/TECH_ARCHITECTURE.md`、`AGENTS.md`、`.cursor/rules/auth-and-user.mdc`。 |

---

## 5. 接口契约（前端视角）

Base：`{WACHI_AUTH_BASE}/api/v1`

### 5.1 Authorize

`GET /auth/oauth/google/authorize?app_id={app_id}&redirect_uri={uri}`

成功 `data`：`{ provider, authorization_url }`

### 5.2 Callback

`POST /auth/oauth/google/callback`  
Body：`{ app_id, code, redirect_uri }`

成功 `data`（与登录一致）：

```json
{
  "user_id": "...",
  "email": "...",
  "nickname": "...",
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer",
  "expires_in": 7200
}
```

> 注：callback 响应可能无 `avatar_url`；展示头像以随后 `GET /user/me` 的 `avatar_url` 为准（可选：回调成功后再拉一次 me）。

### 5.3 Me / Refresh / Logout

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/user/me` | Bearer access | 用户资料 |
| POST | `/auth/refresh` | Body `refresh_token` | 轮换双 token |
| POST | `/auth/logout` | Bearer access | 撤销 refresh |

### 5.4 前端需处理的错误码（节选）

| code | 场景 | 前端行为 |
|------|------|----------|
| 0 | 成功 | 正常 |
| 1007 | Token 无效/过期 | 尝试 refresh；失败则清态并引导登录 |
| 1008 | 三方登录失败 | 回调页错误提示 |
| 2001 | App 不存在/停用 | 提示配置错误 |
| 2006 | redirect_uri 不在白名单 | 提示配置错误（联调阻塞） |
| 2007 | 未配置 Google | 提示配置错误 |
| HTTP 401 | 未授权 | 同 1007 策略 |

---

## 6. 页面与路由

| 路由 | 类型 | 说明 |
|------|------|------|
| `/login` | 改造 | 发起 OAuth |
| `/login/callback` | **新增** | 消化 `code`、完成登录 |
| `/`（home） | 小改 | logout 目标服务变更 |
| 其他 | 不变 | — |

**redirect_uri 计算规则：**

- 运行时：`typeof window !== 'undefined' ? `${window.location.origin}/login/callback` : ''`
- 生产期望值：`https://qianting.xyz/login/callback`
- 本地期望值：`http://localhost:3000/login/callback`（须在 wachi-auth 白名单内才能本地走通 OAuth）

**callbackUrl 安全：**

- 仅允许以 `/` 开头的相对路径，且不得以 `//` 开头；否则回退 `/`。

---

## 7. 数据与状态

### 7.1 localStorage keys

| Key | 说明 |
|-----|------|
| `access_token` | 沿用 |
| `refresh_token` | **新增** |
| `user_name` | 沿用 |
| `user_avatar` | 沿用 |

### 7.2 sessionStorage（OAuth 跳转临时）

| Key | 说明 |
|-----|------|
| `oauth_callback_url` | 登录成功后的站内回跳路径 |

### 7.3 用户字段映射

| UI / UserManager | wachi-auth |
|------------------|------------|
| token | `access_token` |
| name | `nickname` → fallback `email` |
| avatar | `avatar_url` |

---

## 8. 环境变量

| 变量 | 必填 | 示例 | 说明 |
|------|------|------|------|
| `NEXT_PUBLIC_WACHI_AUTH_BASE` | 建议 | `https://auth.qianting.xyz` | 无则默认该生产地址 |
| `NEXT_PUBLIC_WACHI_AUTH_APP_ID` | 是 | `app_zHlN4VrsJHKhM77g` | 缺失则登录不可用并提示 |
| `NEXT_PUBLIC_API_BASE` | 否 | `https://api.qianting.xyz` | 业务 API，逻辑不变 |
| `NEXT_PUBLIC_FIREBASE_*` | 删除 | — | 迁移后移除 |

---

## 9. 兼容性与迁移

- **旧 Firebase / 旧 qianting `/auth/login` 签发的 token**：迁移后一律视为无效；用户需重新 Google 登录。
- 不要求做 token 平滑迁移。
- 登出/登录成功后建议覆盖写入，避免残留旧 refresh。

---

## 10. 测试计划（前端）

| # | 场景 | 期望 |
|---|------|------|
| T1 | 生产完整 Google 登录 | 进入首页且 me 成功 |
| T2 | 带合法 `callbackUrl` | 登录后落到该路径 |
| T3 | 非法 `callbackUrl`（如 `https://evil.com`） | 落到 `/` |
| T4 | 刷新页面 | 仍登录 |
| T5 | 人为清 access 留 refresh 后刷新 | 能 refresh 恢复或按设计清态 |
| T6 | 登出 | 本地清空；再 me 应失败 |
| T7 | 未登录点分析 | 现有「请登录」提示仍可用 |
| T8 | authorize 返回 2006 | 登录页可见错误，不跳转半残 |
| T9 | 构建/类型检查 | 无 firebase 引用；`tsc`/lint 通过 |

---

## 11. 风险与依赖

| 风险 | 影响 | 缓解 |
|------|------|------|
| wachi-auth `redirect_uris` 与请求字符串不完全一致（当前实测仍 2006） | 无法开始 OAuth | 管理端核对精确字符串；联调前复测 authorize |
| Google Console 未配同一 URI | Google 拒绝回调 | 运维核对 Authorized redirect URIs |
| 业务后端未校验 wachi-auth JWT | 能登录不能分析 | 与后端对齐 JWT 校验；前端仍按契约带 Bearer |
| 本地未加 localhost 白名单 | 本地无法走通 OAuth | 白名单增加 localhost，或仅用生产域名联调 |
| access 2h 无 refresh | 用户中途掉线 | 本需求要求实现 refresh（FR-18） |

---

## 12. 交付物清单

1. 代码：登录/回调/auth core/storage/HttpClientInit/home 登出/去 Firebase/env 示例  
2. 文档：AUTH 对接说明、架构、AGENTS、auth cursor rule  
3. 本目录：`02-requirements.md`（本文）→ 确认后 `03-tech-design.md` → 实施

---

## 13. 待你确认的点

请确认本详细需求，并特别拍板：

1. **业务 JWT（A）**：qianting `/analyze` 是否已支持 wachi-auth token？（是 / 否 / 排期中）  
2. **本地白名单（C）**：是否把 `http://localhost:3000/login/callback` 也写入 wachi-auth？  
3. **当前 2006**：请用管理端确认库内 `redirect_uris` 数组的**精确字符串**是否为 `https://qianting.xyz/login/callback`（无空格、无尾斜杠）。前端实测生产 authorize 仍为 2006。  
4. 其余条目（仅 Google、双 token + refresh、callbackUrl 用 sessionStorage、卸载 Firebase）是否按本文落地？

确认后进入 **Step 3 · 技术详细设计**。
