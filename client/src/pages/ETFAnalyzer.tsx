import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Search, TrendingUp, AlertCircle, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ETFAnalyzer() {
  const [etfTicker, setEtfTicker] = useState("");
  const [searchedTicker, setSearchedTicker] = useState("");

  const etfHoldingsQuery = trpc.etf.getHoldings.useQuery(
    { etfTicker: searchedTicker },
    { enabled: !!searchedTicker }
  );

  const handleSearch = () => {
    if (etfTicker.trim()) {
      setSearchedTicker(etfTicker.toUpperCase().trim());
    }
  };

  const holdings = etfHoldingsQuery.data || [];
  const totalWeight = holdings.reduce((sum, h) => sum + h.weight, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PieChart className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-2xl font-bold text-cyan-300">ETF 보유종목 분석기</h1>
                <p className="text-sm text-slate-400">ETF 내부 구성을 투명하게 공개합니다</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="p-6 bg-slate-900/50 border-slate-800 mb-8">
          <h2 className="text-xl font-bold mb-4 text-cyan-300">ETF 검색</h2>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="ETF 티커 입력 (예: SPY, QQQ, VOO)"
              value={etfTicker}
              onChange={(e) => setEtfTicker(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-slate-800 border-slate-700 text-slate-100"
            />
            <Button
              onClick={handleSearch}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
          </div>
          
          {/* Popular ETFs */}
          <div className="mt-4">
            <p className="text-sm text-slate-400 mb-2">인기 ETF:</p>
            <div className="flex flex-wrap gap-2">
              {["SPY", "QQQ", "VOO", "VTI", "IWM", "DIA", "ARKK", "XLF"].map((ticker) => (
                <button
                  key={ticker}
                  onClick={() => {
                    setEtfTicker(ticker);
                    setSearchedTicker(ticker);
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-cyan-400 transition-all"
                >
                  ${ticker}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Results Section */}
        {etfHoldingsQuery.isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-400">데이터 로딩 중...</p>
          </div>
        )}

        {etfHoldingsQuery.isError && (
          <Card className="p-6 bg-red-950/20 border-red-500/50">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="font-bold">데이터를 불러올 수 없습니다</h3>
                <p className="text-sm">ETF 티커를 확인하거나 나중에 다시 시도해주세요.</p>
              </div>
            </div>
          </Card>
        )}

        {searchedTicker && holdings.length === 0 && !etfHoldingsQuery.isLoading && (
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-300 mb-2">
                ${searchedTicker}의 보유종목 데이터가 없습니다
              </h3>
              <p className="text-sm text-slate-400">
                아직 수집되지 않은 ETF입니다. 다른 ETF를 검색해보세요.
              </p>
            </div>
          </Card>
        )}

        {holdings.length > 0 && (
          <>
            {/* Summary Card */}
            <Card className="p-6 bg-gradient-to-br from-cyan-950/30 to-blue-950/30 border-cyan-500/30 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-cyan-300">${searchedTicker}</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-400">보유 종목 수</p>
                  <p className="text-2xl font-bold text-cyan-300">{holdings.length}개</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">총 비중</p>
                  <p className="text-2xl font-bold text-cyan-300">{totalWeight.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">TOP 10 비중</p>
                  <p className="text-2xl font-bold text-cyan-300">
                    {holdings.slice(0, 10).reduce((sum, h) => sum + h.weight, 0).toFixed(2)}%
                  </p>
                </div>
              </div>
            </Card>

            {/* Holdings Table */}
            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <h3 className="text-xl font-bold mb-4 text-cyan-300">보유 종목 상세</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-bold text-slate-300">순위</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-slate-300">티커</th>
                      <th className="text-right py-3 px-4 text-sm font-bold text-slate-300">비중 (%)</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-slate-300">비중 시각화</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding, index) => (
                      <tr key={holding.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 text-slate-400">#{index + 1}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-cyan-300">${holding.stockTicker}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-green-400">{holding.weight.toFixed(2)}%</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-cyan-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(holding.weight * 2, 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
