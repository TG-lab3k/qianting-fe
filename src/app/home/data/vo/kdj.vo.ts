/** 单日 KDJ，与 GET /analyze 的 kdj_week 元素一致（见 docs/QUANT_ANALYZE_API.md） */
export interface KDJDayVo {
  date: string;
  K: number | null;
  D: number | null;
  J: number | null;
}
