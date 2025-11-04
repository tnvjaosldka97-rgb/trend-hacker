import { Flame, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface HotStock {
  ticker: string;
  mentions: number;
  sentiment: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
  dominantSentiment: "bullish" | "bearish" | "neutral";
}

interface HotStocksProps {
  stocks: HotStock[];
}

export default function HotStocks({ stocks }: HotStocksProps) {
  if (!stocks || stocks.length === 0) {
    return null;
  }

  const topStocks = stocks.slice(0, 5);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Flame className="w-7 h-7 text-orange-500 animate-pulse" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          주간 HOT 종목 TOP 5
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {topStocks.map((stock, index) => {
          const totalSentiment = stock.sentiment.bullish + stock.sentiment.bearish + stock.sentiment.neutral;
          const bullishPercent = totalSentiment > 0 ? Math.round((stock.sentiment.bullish / totalSentiment) * 100) : 0;
          const bearishPercent = totalSentiment > 0 ? Math.round((stock.sentiment.bearish / totalSentiment) * 100) : 0;

          const getSentimentIcon = () => {
            if (stock.dominantSentiment === "bullish") return <TrendingUp className="w-5 h-5 text-emerald-400" />;
            if (stock.dominantSentiment === "bearish") return <TrendingDown className="w-5 h-5 text-red-400" />;
            return <Minus className="w-5 h-5 text-slate-400" />;
          };

          const getSentimentColor = () => {
            if (stock.dominantSentiment === "bullish") return "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30";
            if (stock.dominantSentiment === "bearish") return "from-red-500/20 to-red-600/10 border-red-500/30";
            return "from-slate-500/20 to-slate-600/10 border-slate-500/30";
          };

          const getRankBadge = () => {
            const colors = [
              "bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900", // 1위 금색
              "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900", // 2위 은색
              "bg-gradient-to-br from-amber-600 to-amber-700 text-white", // 3위 동색
              "bg-gradient-to-br from-slate-600 to-slate-700 text-white", // 4위
              "bg-gradient-to-br from-slate-700 to-slate-800 text-white", // 5위
            ];
            return colors[index] || colors[4];
          };

          return (
            <div
              key={stock.ticker}
              className={`relative bg-gradient-to-br ${getSentimentColor()} border rounded-xl p-4 hover:scale-105 transition-transform duration-200`}
            >
              {/* 순위 배지 */}
              <div className={`absolute -top-3 -left-3 w-10 h-10 ${getRankBadge()} rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10`}>
                {index + 1}
              </div>

              {/* 티커 */}
              <div className="flex items-center justify-between mb-3 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">${stock.ticker}</span>
                  {getSentimentIcon()}
                </div>
              </div>

              {/* 언급 수 */}
              <div className="mb-3">
                <div className="text-sm text-slate-400 mb-1">언급 횟수</div>
                <div className="text-xl font-bold text-cyan-300">{stock.mentions}회</div>
              </div>

              {/* 감성 비율 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-400">상승 {bullishPercent}%</span>
                  <span className="text-red-400">하락 {bearishPercent}%</span>
                </div>
                <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500"
                    style={{ width: `${bullishPercent}%` }}
                  />
                  <div
                    className="bg-red-500"
                    style={{ width: `${bearishPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
