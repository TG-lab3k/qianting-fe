你是一个顶尖的 Next.js + shadcn/ui 专家，要求代码极致美观、现代轻量、具有精品 SaaS 产品质感。

## 技术栈
- React + Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui 组件库

## 设计风格（核心要求）

整体基调：**白色背景 · 黑色主字体 · 极简轻量 · 现代克制**

- 背景色：纯白 #ffffff，内容区最大宽度 680px，水平居中
- 主字体颜色：#0f0f0f（标题）、#374151（正文）、#9ca3af（辅助说明）
- 字体：标题使用 `Instrument Serif`（衬线，优雅感），数字/代码使用 `JetBrains Mono`，正文使用 `Plus Jakarta Sans`
- 彩色元素极度克制，仅用于：
  - 评分环形进度条描边（单色）
  - 各维度进度条（低饱和度）
  - Verdict Badge（BUY/WATCH/NO 三种状态色块）
  - 少量强调文字
- 卡片：白色背景，1px #e5e7eb 边框，轻微 box-shadow（`0 1px 4px rgba(0,0,0,0.06)`），圆角 12px，无色彩装饰
- 分割线用 #f3f4f6 细线，禁止用色块分区
- 禁止使用渐变背景、光晕效果、网格纹理、深色装饰
- 动效：仅保留卡片淡入上移（fadeUp，轻柔）、进度条填充动画（1s ease），其余不做动效

## 页面功能

1. 顶部 Header：左对齐 Logo + 产品名 "Qianting"，右侧放一个极简的 GitHub 图标链接（#）
2. 页面副标题：一行小字说明，如 "股票量化分析 · 输入代码即刻洞察"
3. 搜索区域：输入框 + 查询按钮，横排，有 focus 边框高亮
4. 点击查询后请求接口：
   GET https://patient-tree-3ef6.leigoti3.workers.dev/api/quant/analyze?ticker={用户输入的ticker}
5. 加载中展示 skeleton 骨架屏（浅灰色矩形，带 shimmer 动画）
6. 请求成功后在输入框下方展示分析结果

## 接口返回数据结构

```ts
interface QuantData {
  ticker: string;       // 股票代码
  score: number;        // 综合评分 0–100
  price: number;        // 当前价格
  bottom: {
    score: number;      // 抄底分 0–100
    verdict: "BUY" | "WATCH" | "NO";
    good: string[];     // 已满足条件
    bad: string[];      // 风险/不足
    trigger: string[];  // 触发条件
  };
  scores: {
    Macro: number;      // 宏观
    Trend: number;      // 趋势
    Flow: number;       // 资金流
    Bottom: number;     // 抄底
    Quality: number;    // 质量
    Valuation: number;  // 估值
    Tailwind: number;   // 催化剂
  };
  last: {
    Close: number;
    MA10: number;
    MA20: number;
    MA50: number;
    MA200: number;
    RSI: number;
    CMF: number;
    DD_252: number;     // 年内回撤（负数，如 -0.257 表示 -25.7%）
    Vol_Z: number;
    BuyPct: number;     // 主动买入占比（%）
    Imbalance: number;
    Risk_Budget: number;
  };
  q_notes: string[];    // 质量注释
  v_notes: string[];    // 估值注释
}
```

## 颜色规则（唯一允许的彩色规则）

| 分数区间 | 颜色（低饱和） |
|----------|---------------|
| ≥ 70     | #16a34a（绿） |
| 40–69    | #d97706（琥珀）|
| < 40     | #dc2626（红） |

Verdict Badge 背景为对应颜色的 10% 透明度，文字为实色，圆角 6px，无边框。

## 结果展示区域（从上到下）

### 模块一：综合评分卡（横向布局）
左侧：
- 股票代码（大号，Instrument Serif，32px）
- 当前价格（$100.61，JetBrains Mono，18px，灰色）
- Verdict Badge（BUY/WATCH/NO）+ 一行说明文字

右侧：
- 环形进度条（直径 120px，描边宽 8px，背景环为 #f3f4f6）
- 中心：综合评分大数字 + "/100" 小字

---

### 模块二：各维度评分（标题 + 进度条列表）
每行：
- 左侧维度名（英文 + 中文括号说明，如 "Macro  宏观"）
- 右侧分数（JetBrains Mono）
- 下方进度条（高度 4px，圆角，背景 #f3f4f6，填充色按分数区间）

---

### 模块三：抄底判定器
标题行：左侧"抄底判定器"，右侧 Bottom Score（数字）+ Verdict Badge

条件列表分三组：
- ✅ 已满足（绿色图标）
- ⚠️ 风险/不足（琥珀色图标）
- 🔔 触发条件（蓝色图标，若数组为空则不渲染该组）

---

### 模块四：关键技术指标
用 `grid-cols-2 md:grid-cols-3 lg:grid-cols-5` 布局展示小卡片：
- 每个卡片：上方浅灰小标签 + 下方黑色 JetBrains Mono 数字
- 展示字段：收盘价 · MA10 · MA20 · MA50 · MA200 · RSI · CMF · 年内回撤 · 买入占比 · 风险预算
- 卡片背景 #fafafa，无边框，圆角 8px

---

### 模块五：基本面注释（两列）
左栏：质量指标（q_notes），右栏：估值指标（v_notes）

每条数据用一行展示：
- 左侧一个 4×4 的圆形色点（质量用 #16a34a，估值用 #d97706）
- 右侧 JetBrains Mono 小字

---

## 代码要求

- 所有代码集中在 `app/page.tsx` 一个文件，禁止拆分组件文件
- 使用 inline style 实现所有样式（不依赖 Tailwind class 名），确保任何环境下都能运行
- 使用 `useState` + `useCallback` 管理状态
- 错误处理：接口失败时在搜索框下方展示一行红色小字提示，不用 toast
- 输入框支持回车键触发查询
- 查询按钮 loading 时禁用并展示内联 SVG spinner
- 字体通过 Google Fonts `@import` 引入：`Instrument+Serif`, `JetBrains+Mono`, `Plus+Jakarta+Sans`

请生成完整可运行的代码。
