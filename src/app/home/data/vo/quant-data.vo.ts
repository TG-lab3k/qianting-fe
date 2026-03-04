import type { BottomDataVo } from "./bottom-data.vo";
import type { ScoresDataVo } from "./scores-data.vo";
import type { LastDataVo } from "./last-data.vo";
import type { TapeDataVo } from "./tape.vo";

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
}
