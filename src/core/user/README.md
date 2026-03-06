# core/user 模块

UserManager 单例，管理用户信息（token、用户名、头像）的存取，并在登录成功/退出登录时通过订阅式全局通知发出事件。

## 怎样使用

业务侧按以下方式使用 `@/core/user` 与 http-client，无需关心内部实现。

### 应用入口（初始化）

在根 layout 或 Provider 中先获取 UserManager，再让 http-client 从 UserManager 取 token：

```ts
import { getUserManager } from "@/core/user";
import { initHttpClient } from "@/core/http-client";

getUserManager(); // 确保单例存在
initHttpClient({ getToken: () => getUserManager().getToken() });
```

之后所有通过 http-client 发出的请求都会自动带上当前用户的 JWT。

### 登录成功后

在登录页或登录逻辑中，拿到服务端返回的 token、用户名、头像后调用：

```ts
getUserManager().login({ token, name, avatar });
```

会更新内存中的用户信息，并触发「登录成功」全局通知，订阅了 `onLogin` 的模块会收到该用户信息。

### 退出登录

调用：

```ts
getUserManager().logout();
```

会清空用户信息并触发「退出登录」通知。

### 在任意模块中订阅登录/登出

需要根据登录态更新 UI（如导航栏头像、登录按钮切换）时，在组件或模块中订阅：

```ts
const unsubLogin = getUserManager().onLogin((user) => {
  // 更新 UI，如 setState({ name: user.name, avatar: user.avatar })
});
const unsubLogout = getUserManager().onLogout(() => {
  // 清空用户相关 UI
});
// 组件卸载时取消订阅
return () => { unsubLogin(); unsubLogout(); };
```

### 读取当前用户信息

随时可调用：

- `getUserManager().getUser()` — 完整 UserVo 快照
- `getUserManager().getToken()` / `getName()` / `getAvatar()` — 单项读取

用于渲染头像、昵称或判断是否已登录（如 `getToken() !== null`）。
