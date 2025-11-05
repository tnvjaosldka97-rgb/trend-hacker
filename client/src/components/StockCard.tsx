import { trpc } from "@/lib/trpc";
import { TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import TweetsList from "./TweetsList";

interface StockCardProps {
  stock: {
    ticker: string;
    count: number;
    bullish: number;
    bearish: number;
    neutral: number;
    latestTweet?: string;
    latestTweetAuthor?: string;
    latestTweetTime?: Date;
    latestTweetUrl?: string;
  };
  index: number;
  formatTimeAgo: (date: Date | null) => string;
}

export default function StockCard({ stock, index, formatTimeAgo }: StockCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Fetch stock information
  const stockInfoQuery = trpc.stocks.getByTicker.useQuery(
    { ticker: stock.ticker },
    { enabled: true, staleTime: 1000 * 60 * 60 } // Cache for 1 hour
  );

  const total = stock.bullish + stock.bearish + stock.neutral;
  const bullishPercent = total > 0 ? Math.round((stock.bullish / total) * 100) : 0;
  const bearishPercent = total > 0 ? Math.round((stock.bearish / total) * 100) : 0;
  const neutralPercent = total > 0 ? Math.round((stock.neutral / total) * 100) : 0;

  const getSentimentColor = () => {
    if (bullishPercent >= 75) return "border-green-500/50 bg-green-950/20";
    if (bearishPercent >= 75) return "border-red-500/50 bg-red-950/20";
    if (bullishPercent > bearishPercent) return "border-green-500/30 bg-green-950/10";
    if (bearishPercent > bullishPercent) return "border-red-500/30 bg-red-950/10";
    return "border-slate-700 bg-slate-900/50";
  };

  const getSentimentBadge = () => {
    if (bullishPercent >= 80) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-sm text-green-300 font-bold">
          🚀 강력 상승 컨센서스
        </div>
      );
    }
    if (bearishPercent >= 80) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-sm text-red-300 font-bold">
          ⚠️ 강력 하락 컨센서스
        </div>
      );
    }
    return null;
  };

  const stockInfo = stockInfoQuery.data;
  const companyName = stockInfo?.name || stock.ticker;
  const category = stockInfo?.category;

  return (
    <div
      key={stock.ticker}
      className={`border-2 ${getSentimentColor()} rounded-lg p-6 transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {/* Stock Logo */}
            {stockInfo?.logoUrl && (
              <img
                src={stockInfo.logoUrl}
                alt={companyName}
                className="w-10 h-10 rounded-lg object-cover bg-white/10"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            
            <div>
              {/* Ticker + Company Name */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold text-cyan-300">${stock.ticker}</span>
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-sm text-slate-300">{companyName}</div>
            </div>
          </div>
          
          {/* Category Badge */}
          {category && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded-full text-xs text-slate-400 mt-1">
              {category}
            </div>
          )}
          
          <div className="text-sm text-slate-400 mt-2">{stock.count}회 언급</div>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-cyan-300">#{index + 1}</div>
        </div>
      </div>

      {/* 감성 분석 결과 */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-green-400">🟢 상승 예상</span>
          <span className="font-bold text-green-300">{stock.bullish}명 ({bullishPercent}%)</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${bullishPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-red-400">🔴 하락 예상</span>
          <span className="font-bold text-red-300">{stock.bearish}명 ({bearishPercent}%)</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-red-500 h-2 rounded-full transition-all"
            style={{ width: `${bearishPercent}%` }}
          />
        </div>

        {neutralPercent > 0 && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">⚪ 중립</span>
              <span className="font-bold text-slate-300">{stock.neutral}명 ({neutralPercent}%)</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-slate-500 h-2 rounded-full transition-all"
                style={{ width: `${neutralPercent}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* 컨센서스 배지 */}
      {getSentimentBadge()}

      {/* 최신 의견 */}
      {stock.latestTweet && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-sm text-slate-300 mb-2">→ {stock.latestTweet}</div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>@{stock.latestTweetAuthor} · {formatTimeAgo(stock.latestTweetTime || null)}</span>
            {stock.latestTweetUrl && (
              <a
                href={stock.latestTweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300"
              >
                원문
              </a>
            )}
          </div>
        </div>
      )}

      {/* 모든 의견 보기 버튼 */}
      {total > 1 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-sm text-cyan-400 transition-all"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              접기
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              {total}명의 의견 모두 보기
            </>
          )}
        </button>
      )}

      {/* 확장된 트윗 리스트 */}
      {isExpanded && <TweetsList ticker={stock.ticker} timeRange="24h" />}
    </div>
  );
}
