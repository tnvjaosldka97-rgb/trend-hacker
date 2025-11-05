import { trpc } from "@/lib/trpc";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TweetsListProps {
  ticker: string;
  timeRange: '24h' | '7d';
}

export default function TweetsList({ ticker, timeRange }: TweetsListProps) {
  const { data: tweets, isLoading, error } = trpc.trending.getTweetsByTicker.useQuery({
    ticker,
    timeRange,
    limit: 50,
  });

  console.log('[TweetsList] ticker:', ticker, 'timeRange:', timeRange);
  console.log('[TweetsList] isLoading:', isLoading, 'tweets:', tweets?.length, 'error:', error);

  if (isLoading) {
    return (
      <div className="mt-4 border-t border-slate-700 pt-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 border-t border-slate-700 pt-4">
        <div className="text-center py-8 text-red-400">
          오류: {error.message}
        </div>
      </div>
    );
  }

  if (!tweets || tweets.length === 0) {
    return (
      <div className="mt-4 border-t border-slate-700 pt-4">
        <div className="text-center py-8 text-slate-500">
          <p>아직 수집된 트윗이 없습니다</p>
          <p className="text-xs mt-2">(Ticker: {ticker}, Range: {timeRange})</p>
        </div>
      </div>
    );
  }

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === 'bullish') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (sentiment === 'bearish') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'bullish') return 'border-green-600/30 bg-green-900/10';
    if (sentiment === 'bearish') return 'border-red-600/30 bg-red-900/10';
    return 'border-slate-700 bg-slate-800/30';
  };

  const getSentimentText = (sentiment: string) => {
    if (sentiment === 'bullish') return '상승 전망';
    if (sentiment === 'bearish') return '하락 전망';
    return '중립';
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}초 전`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
  };

  return (
    <div className="mt-4 space-y-3 border-t border-slate-700 pt-4">
      <div className="text-xs text-slate-400 mb-3">
        💬 전문가 {tweets.length}명의 의견
      </div>
      
      {tweets.map((tweet, idx) => (
        <div
          key={idx}
          className={`border ${getSentimentColor(tweet.sentiment)} rounded-lg p-4 hover:bg-slate-800/50 transition-all`}
        >
          {/* 전문가 정보 */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">
                @{tweet.authorUsername}
              </span>
              <span className="text-xs text-slate-500">
                {formatTimeAgo(tweet.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {getSentimentIcon(tweet.sentiment)}
              <span className={
                tweet.sentiment === 'bullish' ? 'text-green-400' :
                tweet.sentiment === 'bearish' ? 'text-red-400' :
                'text-slate-400'
              }>
                {getSentimentText(tweet.sentiment)}
              </span>
            </div>
          </div>

          {/* 트윗 내용 */}
          <p className="text-slate-300 text-sm mb-3 leading-relaxed">
            {tweet.text}
          </p>

          {/* 원문 링크 */}
          {tweet.url && (
            <a
              href={tweet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              원문 보기
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
