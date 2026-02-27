// components/StockResultDisplay.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApiResponse } from "@/lib/types";

const API_BASE = "http://34.53.18.34:8080";

export function StockResultDisplay() {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker");

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/analyze?ticker=${ticker}`);
        const json: ApiResponse = await res.json();

        if (json.status !== 0) {
          throw new Error(json.message || "接口返回非成功状态");
        }

        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "请求失败");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  if (!ticker) {
    return (
      <div className="text-center py-12 text-gray-400">
        输入股票代码并点击查询开始分析
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4 mx-auto bg-gray-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-950 border-red-800 text-red-200">
        <AlertTitle>查询失败</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data?.data) {
    return null;
  }

  const { data: result } = data;
  const { bottom, scores, score, price, q_notes, v_notes } = result;

  return (
    <div className="space-y-8">
      {/* 头部概览 */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">{result.ticker}</h2>
        <div className="text-4xl font-mono font-bold">
          ${price.toFixed(2)}
        </div>
        <div className="text-xl">
          综合评分：{score.toFixed(1)} | Bottom Verdict:{" "}
          <span
            className={
              bottom.verdict === "BUY"
                ? "text-green-400"
                : bottom.verdict === "WATCH"
                ? "text-yellow-400"
                : "text-red-400"
            }
          >
            {bottom.verdict}
          </span>
        </div>
      </div>

      {/* 雷达分数 */}
      <Card className="bg-gray-950 border-gray-800">
        <CardHeader>
          <CardTitle className="text-center">维度评分 (0-100)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 text-center">
            {Object.entries(scores).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="text-sm text-gray-400">{key}</div>
                <div className="text-2xl font-bold">
                  {value === "N/A" ? "N/A" : Number(value).toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 抄底判定 */}
      <Card className="bg-gray-950 border-gray-800">
        <CardHeader>
          <CardTitle>抄底判定器 (BUY/WATCH/NO)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Verdict:</span>
            <span
              className={`text-xl font-bold ${
                bottom.verdict === "BUY"
                  ? "text-green-400"
                  : bottom.verdict === "WATCH"
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {bottom.verdict} ({bottom.score}/100)
            </span>
          </div>

          <div>
            <h4 className="font-medium mb-2">已满足：</h4>
            <ul className="space-y-1">
              {bottom.good.map((item, i) => (
                <li key={i} className="text-green-400">✓ {item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">风险/不足：</h4>
            <ul className="space-y-1">
              {bottom.bad.map((item, i) => (
                <li key={i} className="text-red-400">! {item}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 质量与估值笔记 */}
      {(q_notes.length > 0 || v_notes.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {q_notes.length > 0 && (
            <Card className="bg-gray-950 border-gray-800">
              <CardHeader>
                <CardTitle>Quality Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {q_notes.map((note, i) => (
                    <li key={i} className="text-gray-300">{note}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {v_notes.length > 0 && (
            <Card className="bg-gray-950 border-gray-800">
              <CardHeader>
                <CardTitle>Valuation Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {v_notes.map((note, i) => (
                    <li key={i} className="text-gray-300">{note}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}