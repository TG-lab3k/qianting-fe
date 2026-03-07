import type { BottomDataVo } from "./bottom-data.vo";
import type { ScoresDataVo } from "./scores-data.vo";
import type { LastDataVo } from "./last-data.vo";
import type { TapeDataVo } from "./tape.vo";
import type { KDJDayVo } from "./kdj.vo";

export interface QuantDataVo {
  ticker: string;
  score: number;
  price: number;
  bottom: BottomDataVo;
  scores: ScoresDataVo;
  last: LastDataVo;
  q_notes: string[];
  v_notes: string[];
  tape?: TapeDataVo;
  /** 过去一周（最多 5 个交易日）的 KDJ 序列，按日期从早到晚 */
  kdj_week?: KDJDayVo[];
}
