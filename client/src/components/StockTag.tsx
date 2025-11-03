import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StockTagProps {
  symbol: string;
  sentiment?: "bullish" | "bearish" | "neutral";
}

export function StockTag({ symbol, sentiment }: StockTagProps) {
  const [stockData, setStockData] = useState<{
    price: number;
    change: number;
    changePercent: number;
  } | null>(null);

  const { data: quotes, error, isError } = trpc.stocks.getQuotes.useQuery(
    { symbols: [symbol] },
    { 
      refetchInterval: 60000, // Refetch every minute
      retry: 1, // Only retry once
      retryDelay: 1000, // Wait 1s before retry
    }
  );

  useEffect(() => {
    if (quotes && quotes[symbol]) {
      setStockData({
        price: quotes[symbol].regularMarketPrice,
        change: quotes[symbol].regularMarketChange,
        changePercent: quotes[symbol].regularMarketChangePercent,
      });
    }
  }, [quotes, symbol]);

  // Determine color based on sentiment or price change
  const getColorClass = () => {
    if (sentiment === "bullish" || (stockData && stockData.change > 0)) {
      return "bg-green-500/20 border-green-500/30 text-green-300";
    } else if (sentiment === "bearish" || (stockData && stockData.change < 0)) {
      return "bg-red-500/20 border-red-500/30 text-red-300";
    }
    return "bg-gray-500/20 border-gray-500/30 text-gray-300";
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return "N/A";
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  const formatVolume = (num: number | undefined) => {
    if (!num) return "N/A";
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
  };

  const quote = quotes && quotes[symbol];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 px-2 py-1 border rounded text-xs font-medium cursor-pointer ${getColorClass()}`}>
            <span>${symbol}</span>
            {stockData && (
              <>
                {stockData.change > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : stockData.change < 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : null}
                <span className="font-semibold">
                  {stockData.changePercent > 0 ? "+" : ""}
                  {stockData.changePercent.toFixed(2)}%
                </span>
              </>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-900 border-gray-700 p-4 min-w-[250px]">
          <div className="space-y-2">
            <div className="font-semibold text-white text-sm mb-3">${symbol}</div>
            {quote ? (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">현재가:</span>
                  <span className="text-white font-semibold">{formatNumber(quote.regularMarketPrice)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">시가총액:</span>
                  <span className="text-white">{formatNumber(quote.marketCap)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">거래량:</span>
                  <span className="text-white">{formatVolume(quote.volume)}</span>
                </div>
                <div className="border-t border-gray-700 my-2 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">시가:</span>
                    <span className="text-white">{formatNumber(quote.regularMarketOpen)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">고가:</span>
                    <span className="text-white">{formatNumber(quote.regularMarketDayHigh)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">저가:</span>
                    <span className="text-white">{formatNumber(quote.regularMarketDayLow)}</span>
                  </div>
                </div>
                <div className="border-t border-gray-700 my-2 pt-2">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400">52주 최고:</span>
                    <span className="text-white">{formatNumber(quote.fiftyTwoWeekHigh)}</span>
                  </div>
                  <div className="flex justify-between text-xs mb-3">
                    <span className="text-gray-400">52주 최저:</span>
                    <span className="text-white">{formatNumber(quote.fiftyTwoWeekLow)}</span>
                  </div>
                  {/* 52주 범위 막대 그래프 */}
                  {quote.fiftyTwoWeekHigh && quote.fiftyTwoWeekLow && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>52주 범위</span>
                        <span>
                          {((quote.regularMarketPrice - quote.fiftyTwoWeekLow) / (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                          style={{
                            width: `${((quote.regularMarketPrice - quote.fiftyTwoWeekLow) / (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow) * 100)}%`
                          }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-full shadow-lg"
                          style={{
                            left: `${((quote.regularMarketPrice - quote.fiftyTwoWeekLow) / (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow) * 100)}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{formatNumber(quote.fiftyTwoWeekLow)}</span>
                        <span>{formatNumber(quote.fiftyTwoWeekHigh)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-xs text-gray-400">데이터를 불러오는 중...</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
