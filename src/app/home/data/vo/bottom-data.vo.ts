export interface BottomDataVo {
  score: number;
  verdict: "BUY" | "WATCH" | "NO";
  good: string[];
  bad: string[];
  trigger: string[];
}
