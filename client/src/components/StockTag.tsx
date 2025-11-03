import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

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

  const { data: quotes } = trpc.stocks.getQuotes.useQuery(
    { symbols: [symbol] },
    { refetchInterval: 60000 } // Refetch every minute
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

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 border rounded text-xs font-medium ${getColorClass()}`}>
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
  );
}
