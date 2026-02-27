// components/StockSearchForm.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export function StockSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTicker = searchParams.get("ticker") || "";

  const [ticker, setTicker] = useState(initialTicker);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setLoading(true);
    // 使用 URL 查询参数方式跳转，方便分享和刷新
    router.push(`/?ticker=${ticker.trim().toUpperCase()}`);
    // 实际查询在 StockResultDisplay 中通过 useEffect 发起
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
      <Input
        type="text"
        placeholder="输入股票代码，例如：NBIS, AAPL, 600519.SH"
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
        className="flex-1 bg-black border-black text-white placeholder:text-gray-500 focus-visible:ring-gray-700"
        disabled={loading}
      />
      <Button
        type="submit"
        disabled={loading || !ticker.trim()}
        className="bg-black hover:bg-gray-900 text-white border border-gray-700 min-w-[100px]"
      >
        {loading ? "查询中..." : "查询"}
      </Button>
    </form>
  );
}