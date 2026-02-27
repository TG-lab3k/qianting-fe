export interface ApiResponse {
  status: number
  data?: {
    ticker: string
    score: number
    price: number
    bottom: {
      score: number
      verdict: "BUY" | "WATCH" | "NO"
      good: string[]
      bad: string[]
      trigger: string[]
    }
    scores: Record<string, number | "N/A">
    last: Record<string, any>
    q_notes: string[]
    v_notes: string[]
  }
  message?: string
}