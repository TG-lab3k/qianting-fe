import type { QuantDataVo } from "./quant-data.vo";

export interface AnalyzeApiResponseVo {
  status: number;
  data: QuantDataVo;
}
