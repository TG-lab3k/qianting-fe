# 量化分析 API — 前端接口说明

本文档描述**单标的量化分析**接口 `GET /analyze`，供前端直接对接。响应结构与 [server.py](../server.py) 及 [quant_core.py](../quant_core.py) 一致；完整示例见 [quant_api_data.json](../quant_api_data.json)。

---

## 1. 概述

- **用途**：根据股票代码返回多维度评分、抄底结论（BUY/WATCH/NO）、最新技术指标、Flow Tape（买卖压力代理）、过去一周 KDJ 等。
- **Base URL**：由部署决定（如 `https://xxx.run.app` 或通过网关 `/api`），文档中用 `{BASE_URL}`，前端替换为实际地址。
- **认证**：需登录态，请求头携带 `Authorization: Bearer <access_token>`（与现有登录接口返回的 `access_token` 一致）。未带或无效返回 401。

---

## 2. 请求

| 项 | 说明 |
|----|------|
| Method | `GET` |
| URL | `{BASE_URL}/analyze?ticker={ticker}` |
| Query | `ticker`（必填）：股票代码，支持 6 位 A 股（如 `600519`）或美股代码（如 `AAPL`），后端会做国际代码转换。 |
| Headers | `Authorization: Bearer <access_token>` |

---

## 3. 成功响应（HTTP 200 且 code === 0）

响应体形如：

```json
{
  "code": 0,
  "data": { ... }
}
```

业务数据在 `data` 中，字段如下。

| 字段 | 类型 | 说明 |
|------|------|------|
| `ticker` | string | 标的代码（大写） |
| `score` | number \| null | 综合评分 0–100，缺失时为 null |
| `price` | number \| null | 最新收盘价，即 last.Close |
| `bottom` | object | 抄底判定：`score`（0–100）、`verdict`（"BUY" \| "WATCH" \| "NO"）、`good`（string[]）、`bad`（string[]）、`trigger`（string[]） |
| `scores` | object | 各维度分：`Macro`、`Trend`、`Flow`、`Bottom`、`Quality`、`Valuation`、`Tailwind`（均为 number，缺失维度可能无键或为 null） |
| `last` | object | 最新一根日线及技术指标（键名与 quant_core 的 latest() 一致），包含但不限于：`Open`、`High`、`Low`、`Close`、`Volume`、`MA10`、`MA20`、`MA60`、`MA200`、`DD_252`、`VWAP`、`CMF`、`RSI`、`MFI`、`Vol_Z`、`RangePct`、`UpVol_Ratio_20`、`Squeeze`、`CMF_Cross_Up`、`CMF_Cross_Dn`、`Ret_1d`、`Risk_Budget`、`BuyProxyVol`、`SellProxyVol`、`Imbalance`、`BuyPct`、`Range_Q`、`BlockProxy`；若已启用 KDJ，还包含 `KDJ_K`、`KDJ_D`、`KDJ_J`（number \| null） |
| `q_notes` | string[] | 质量维度（Quality）说明文案 |
| `v_notes` | string[] | 估值维度（Valuation）说明文案 |
| `tape` | object | Flow Tape：买卖压力代理与异动日。包含 `top_buy`、`top_sell`、`monthly`、`blocks`，均为「行数组」（每行为一条记录）。`top_buy`/`top_sell` 列含：Date、Close、Ret%、Buy%、VolZ、RangeQ、CMF、Imbalance、BlockProxy；`monthly` 列含：Month、BuyProxyVol、SellProxyVol、TotalVol、AvgVolZ、AvgCMF、UpDays、Days、BuyPct_Month；`blocks` 列含：Date、Close、Ret%、Vol_Z、Range_Q、CMF、Imbalance、BlockProxy。无数据时为空数组或空对象。 |
| `kdj_week` | array | 过去一周（最多 5 个交易日）的 KDJ 序列。每项：`{ "date": "YYYY-MM-DD", "K": number | null, "D": number | null, "J": number | null }`，按日期从早到晚。新股/数据不足时长度可能小于 5。 |

---

## 4. 错误响应

- **HTTP 200 且 code !== 0**：业务错误，如 `{ "code": 401, "message": "Unauthorized" }`、`{ "code": 503, "message": "Service unavailable" }`。前端应判断 `code === 0` 再使用 `data`。
- **HTTP 401**：未登录或 token 无效/过期，应清除本地 token 并引导登录。
- **HTTP 503**：服务或依赖不可用。
- **HTTP 500**：服务器异常，body 形如 `{ "code": 500, "message": "<错误信息>" }`。

---

## 5. 完整示例

见项目根目录 [quant_api_data.json](../quant_api_data.json)，其中 `data` 为当前接口的完整响应示例（含 `tape`、`kdj_week`）。

---

## 6. TypeScript 类型片段（可选）

```ts
export interface AnalyzeBottom {
  score: number;
  verdict: "BUY" | "WATCH" | "NO";
  good: string[];
  bad: string[];
  trigger: string[];
}

export interface AnalyzeScores {
  Macro?: number;
  Trend?: number;
  Flow?: number;
  Bottom?: number;
  Quality?: number;
  Valuation?: number;
  Tailwind?: number;
}

export interface KDJDay {
  date: string;
  K: number | null;
  D: number | null;
  J: number | null;
}

export interface AnalyzeData {
  ticker: string;
  score: number | null;
  price: number | null;
  bottom: AnalyzeBottom;
  scores: AnalyzeScores;
  last: Record<string, unknown>;
  q_notes: string[];
  v_notes: string[];
  tape: {
    top_buy?: Record<string, unknown>[];
    top_sell?: Record<string, unknown>[];
    monthly?: Record<string, unknown>[];
    blocks?: Record<string, unknown>[];
  };
  kdj_week: KDJDay[];
}

export interface AnalyzeResponse {
  code: number;
  data?: AnalyzeData;
  message?: string;
}
```

---

## 7. 参考

- 后端入口：[server.py](../server.py) 中 `GET /analyze`
- 量化核心与指标说明：[quant_core.py](../quant_core.py)、[AGENTS.md](../AGENTS.md)
