import { get, type Result } from "@/core/http-client";
import type { QuantDataVo } from "./vo";

const ANALYZE_BASE = "https://api.qianting.xyz";

/**
 * Home 模块接口封装，使用 http-client 发起请求（自动携带 JWT）。
 * get 返回 Result<T>，T 为业务层传入的 payload 类型，成功时 res.data 即为 T（即接口 body.data）。
 */
export const Apis = {
  /**
   * 根据股票代码请求分析结果。
   * @param ticker 股票代码（会转为大写）
   * @returns 成功时 { ok: true, data }（data 为 QuantDataVo），失败时 { ok: false, errorCode, errorMessage }
   */
  async analyze(ticker: string): Promise<Result<QuantDataVo>> {
    const sym = ticker.trim().toUpperCase();
    if (!sym) {
      return { ok: false, errorCode: -1, errorMessage: "股票代码不能为空" };
    }
    const url = `${ANALYZE_BASE}/analyze?ticker=${encodeURIComponent(sym)}`;
    const res = await get<QuantDataVo>(url);
    if (!res.ok) return { ok: false, errorCode: res.errorCode, errorMessage: res.errorMessage };
    return { ok: true, data: res.data };
  },
};
