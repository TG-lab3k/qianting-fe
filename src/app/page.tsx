// app/page.tsx
import { StockSearchForm } from "@/components/StockSearchForm";
import { StockResultDisplay } from "@/components/StockResultDisplay";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* 导航栏 */}
      <header className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Qianting</h1>
        </div>
      </header>

      {/* 主体内容 */}
      <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-8">
          {/* 搜索框 */}
          <StockSearchForm />

          {/* 结果展示区域 */}
          <Suspense fallback={<div className="text-center py-12">加载中...</div>}>
            <StockResultDisplay />
          </Suspense>
        </div>
      </div>

      {/* 页脚（可选） */}
      <footer className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        <p>数据来源于量化分析接口，仅供参考，不构成投资建议</p>
      </footer>
    </main>
  );
}