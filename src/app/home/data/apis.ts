import { get } from "@/core/http-client";
import type { QuantDataVo, AnalyzeApiResponseVo } from "./vo";

const ANALYZE_BASE = "https://api.qianting.xyz";

/**
 * Home 模块接口封装，使用 http-client 发起请求（自动携带 JWT）。
 */
export const Apis = {
  /**
   * 根据股票代码请求分析结果。
   * @param ticker 股票代码（会转为大写）
   * @returns 分析数据
   * @throws 网络错误或接口返回 status !== 0 时抛出
   */
  async analyze(ticker: string): Promise<QuantDataVo> {
    const sym = ticker.trim().toUpperCase();
    if (!sym) {
      throw new Error("股票代码不能为空");
    }
    const url = `${ANALYZE_BASE}/analyze?ticker=${encodeURIComponent(sym)}`;
    const res = await get<AnalyzeApiResponseVo>(url);
    const body = res.data;
    if (body.status !== 0) {
      throw new Error("接口返回异常");
    }
    return body.data;
  },
};
