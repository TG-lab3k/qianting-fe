# qianting-fe · Agent 说明

面向 AI Agent 与开发者的项目概览，便于快速理解技术栈、目录约定与扩展方式。详细架构见 [docs/TECH_ARCHITECTURE.md](docs/TECH_ARCHITECTURE.md)。

---

## 项目简介

**qianting-fe**（Qianting · 股票量化分析）：输入股票代码获取多维量化评分报告，支持 Google 登录与登录态管理。

---

## 技术栈

- **框架**: Next.js 16（App Router）、React 19、TypeScript 5、React Compiler
- **HTTP**: 统一 [src/core/http-client](src/core/http-client/index.ts)（Axios 单例、Bearer 注入、`Result<T>` 封装；认证请求可用请求级 `baseURL`）
- **认证**: [wachi-auth](https://auth.qianting.xyz)（Google OAuth）+ localStorage 双 token（access / refresh）+ UserManager
- **UI**: Tailwind CSS v4、shadcn 风格组件（Radix UI、CVA、tailwind-merge、clsx）
- **路径别名**: `@/*` → `./src/*`

---

## 目录与分层

| 目录 | 职责 |
|------|------|
| **src/app/** | 路由与页面；根 layout、HttpClientInit、各 page |
| **src/core/** | 与框架解耦的核心：http-client、auth、user |
| **src/app/<feature>/data/** | 各功能数据层：apis.ts + vo/*.vo.ts |
| **src/components/ui/** | 通用 UI 组件（shadcn 风格） |
| **src/lib/** | 工具（如 `cn()`）、通用类型 |

---

## 约定要点

1. **请求**：一律通过 `@/core/http-client` 的 `get`/`post` 等发起，使用 `Result<T>`；调用方根据 `res.ok` 处理成功/失败。不在业务层直接使用 axios 或 fetch。
2. **认证**：Google OAuth（wachi-auth authorize → 回调 `/login/callback` 换 token）→ localStorage + UserManager；应用入口由 `HttpClientInit` 恢复 token 并 `initHttpClient({ getToken })`；认证 API 使用 `baseURL: WACHI_AUTH_BASE`。
3. **新功能**：在对应 app 模块下新增 `data/apis.ts` 与 `data/vo/`，复用 core 的 http、auth、user。

---

## 关键文件

- **入口与布局**: [src/app/layout.tsx](src/app/layout.tsx)、[src/app/HttpClientInit.tsx](src/app/HttpClientInit.tsx)
- **Core**: [src/core/http-client/index.ts](src/core/http-client/index.ts)、[src/core/auth](src/core/auth)、[src/core/user](src/core/user)
- **登录**: [src/app/login/page.tsx](src/app/login/page.tsx)、[src/app/login/callback/page.tsx](src/app/login/callback/page.tsx)
- **示例数据层**: [src/app/home/data/apis.ts](src/app/home/data/apis.ts)、[src/app/home/data/vo](src/app/home/data/vo)
- **主题与工具**: [src/app/globals.css](src/app/globals.css)、[src/lib/utils.ts](src/lib/utils.ts)
- **认证对接说明**: [docs/AUTH_API_FRONTEND.md](docs/AUTH_API_FRONTEND.md)

详细数据流、认证流程与图示见 **docs/TECH_ARCHITECTURE.md**。
