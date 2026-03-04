export interface TapeDayRowVo {
  Date?: string | null;
  Close?: number | null;
  "Ret%"?: number | null;
  "Buy%"?: number | null;
  VolZ?: number | null;
  RangeQ?: number | null;
  CMF?: number | null;
  Imbalance?: number | null;
  BlockProxy?: string | null;
}

export interface BlockRowVo {
  Date?: string | null;
  Close?: number | null;
  "Ret%"?: number | null;
  Vol_Z?: number | null;
  Range_Q?: number | null;
  CMF?: number | null;
  Imbalance?: number | null;
  BlockProxy?: string | null;
}

export interface MonthlyRowVo {
  Month?: string | null;
  BuyPct_Month?: number | null;
  AvgVolZ?: number | null;
  AvgCMF?: number | null;
  UpDays?: number | null;
  Days?: number | null;
}

export interface TapeDataVo {
  top_buy?: TapeDayRowVo[];
  top_sell?: TapeDayRowVo[];
  monthly?: MonthlyRowVo[];
  blocks?: BlockRowVo[];
}
