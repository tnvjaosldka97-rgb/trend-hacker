import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Activity, BarChart3, ChevronDown, ChevronUp, Clock, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import StockRanking from "@/components/StockRanking";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"realtime" | "today" | "weekly" | "consensus">("realtime");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedStocks, setExpandedStocks] = useState<Set<string>>(new Set());

  const realtimeQuery = trpc.trending.realtime.useQuery(undefined, {
    enabled: activeTab === "realtime",
    refetchInterval: 3 * 60 * 1000, // 3분마다 자동 새로고침
  });

  const todayQuery = trpc.trending.today.useQuery(undefined, {
    enabled: activeTab === "today",
  });

  const weeklyQuery = trpc.trending.weekly.useQuery(undefined, {
    enabled: activeTab === "weekly",
  });

  const consensusQuery = trpc.trending.today.useQuery(undefined, {
    enabled: activeTab === "consensus",
  });

  // 실시간 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "";
    const seconds = Math.floor((currentTime.getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}초 전`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
  };

  const formatNextUpdate = (date: Date | null) => {
    if (!date) return "";
    const seconds = Math.floor((new Date(date).getTime() - currentTime.getTime()) / 1000);
    if (seconds < 0) return "곧 업데이트";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs}초 후`;
  };

  const toggleExpanded = (ticker: string) => {
    setExpandedStocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ticker)) {
        newSet.delete(ticker);
      } else {
        newSet.add(ticker);
      }
      return newSet;
    });
  };

  const getActiveData = () => {
    if (activeTab === "realtime") return realtimeQuery.data;
    if (activeTab === "today") return todayQuery.data;
    if (activeTab === "weekly") return weeklyQuery.data;
    if (activeTab === "consensus") return consensusQuery.data;
    return realtimeQuery.data;
  };

  const activeData = getActiveData();
  let stocks = activeData?.stocks || [];
  
  // 강력 컨센서스 탭일 때 필터링
  if (activeTab === "consensus") {
    stocks = stocks.filter(s => {
      const total = s.bullish + s.bearish + s.neutral;
      if (total === 0) return false;
      const bullishRatio = s.bullish / total;
      const bearishRatio = s.bearish / total;
      return bullishRatio >= 0.8 || bearishRatio >= 0.8; // 80% 이상
    });
  }
  
  // 감성 분석 기반 분류
  const bullishStocks = stocks.filter(s => {
    const total = s.bullish + s.bearish + s.neutral;
    if (total === 0) return false;
    return (s.bullish / total) >= 0.6; // 60% 이상 상승 전망
  });
  
  const bearishStocks = stocks.filter(s => {
    const total = s.bullish + s.bearish + s.neutral;
    if (total === 0) return false;
    return (s.bearish / total) >= 0.6; // 60% 이상 하락 전망
  });
  
  const mixedStocks = stocks.filter(s => {
    const total = s.bullish + s.bearish + s.neutral;
    if (total === 0) return true;
    const bullishRatio = s.bullish / total;
    const bearishRatio = s.bearish / total;
    return bullishRatio < 0.6 && bearishRatio < 0.6; // 의견 분분
  });

  const getSentimentColor = (stock: any) => {
    const total = stock.bullish + stock.bearish + stock.neutral;
    if (total === 0) return "border-slate-600";
    const bullishRatio = stock.bullish / total;
    const bearishRatio = stock.bearish / total;
    
    if (bullishRatio >= 0.8) return "border-green-500 bg-green-500/10"; // 강력 상승
    if (bullishRatio >= 0.6) return "border-green-600 bg-green-600/5"; // 상승
    if (bearishRatio >= 0.8) return "border-red-500 bg-red-500/10"; // 강력 하락
    if (bearishRatio >= 0.6) return "border-red-600 bg-red-600/5"; // 하락
    return "border-slate-600 bg-slate-800/50"; // 의견 분분
  };

  const getSentimentBadge = (stock: any) => {
    const total = stock.bullish + stock.bearish + stock.neutral;
    if (total === 0) return null;
    const bullishRatio = stock.bullish / total;
    const bearishRatio = stock.bearish / total;
    
    if (bullishRatio >= 0.8) return <span className="text-xs font-bold text-green-400">⭐ 강력 상승 컨센서스</span>;
    if (bearishRatio >= 0.8) return <span className="text-xs font-bold text-red-400">⚠️ 강력 하락 컨센서스</span>;
    return null;
  };

  const renderStockCard = (stock: any, index: number) => {
    const total = stock.bullish + stock.bearish + stock.neutral;
    const bullishPercent = total > 0 ? Math.round((stock.bullish / total) * 100) : 0;
    const bearishPercent = total > 0 ? Math.round((stock.bearish / total) * 100) : 0;
    const neutralPercent = total > 0 ? Math.round((stock.neutral / total) * 100) : 0;
    const isExpanded = expandedStocks.has(stock.ticker);

    return (
      <div
        key={stock.ticker}
        className={`border-2 ${getSentimentColor(stock)} rounded-lg p-6 transition-all hover:scale-[1.02]`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold text-cyan-300">${stock.ticker}</span>
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-sm text-slate-400">{stock.count}회 언급</div>
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
        {getSentimentBadge(stock)}

        {/* 최신 의견 */}
        {stock.latestTweet && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="text-sm text-slate-300 mb-2">→ {stock.latestTweet}</div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>@{stock.latestTweetAuthor} · {formatTimeAgo(stock.latestTweetTime)}</span>
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
            onClick={() => toggleExpanded(stock.ticker)}
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

        {/* 확장된 트윗 리스트 (TODO: 실제 데이터 연동 필요) */}
        {isExpanded && (
          <div className="mt-4 space-y-3 border-t border-slate-700 pt-4">
            <div className="text-xs text-slate-500 mb-2">
              💡 전체 {total}명의 전문가 의견을 곧 표시할 예정입니다
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* IT 배경 */}
      <div
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage: "url('/bg-tech.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* 헤더 */}
      <header className="relative border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 왼쪽: 로고 */}
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="Trend Hacker Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold text-cyan-300 flex items-center gap-2">
                  <Activity className="w-7 h-7" />
                  TREND HACKER
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">500+ 검증된 전문가 · 실시간 업데이트</p>
              </div>
            </div>
            
            {/* 오른쪽: 업데이트 타이머 */}
            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="text-xs text-slate-400 mb-1">LAST UPDATE</div>
                <div className="font-mono font-bold text-cyan-300 text-lg">
                  {(activeData as any)?.lastUpdate ? formatTimeAgo((activeData as any).lastUpdate) : "대기 중"}
                </div>
              </div>
              <div className="w-px h-12 bg-slate-700"></div>
              <div className="text-right">
                <div className="text-xs text-slate-400 mb-1">NEXT UPDATE</div>
                <div className="font-mono font-bold text-cyan-300 text-lg">
                  {(activeData as any)?.nextUpdate ? formatNextUpdate((activeData as any).nextUpdate) : "대기 중"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 통계 카드 */}
      <div className="relative container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-950/40 border border-cyan-700/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-cyan-400" />
              <span className="text-slate-300 text-sm">전문가</span>
            </div>
            <div className="text-4xl font-bold text-cyan-300">500+</div>
            <div className="text-xs text-slate-400 mt-1">검증된 계정</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 border border-blue-700/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <span className="text-slate-300 text-sm">트윗</span>
            </div>
            <div className="text-4xl font-bold text-blue-300">{activeData?.totalTweets || 0}</div>
            <div className="text-xs text-slate-400 mt-1">오늘 수집</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 border border-purple-700/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <span className="text-slate-300 text-sm">종목</span>
            </div>
            <div className="text-4xl font-bold text-purple-300">{stocks.length}</div>
            <div className="text-xs text-slate-400 mt-1">추적 중</div>
          </div>

          <div className="bg-gradient-to-br from-pink-900/40 to-pink-950/40 border border-pink-700/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-pink-400" />
              <span className="text-slate-300 text-sm">업데이트</span>
            </div>
            <div className="text-4xl font-bold text-pink-300">3분</div>
            <div className="text-xs text-slate-400 mt-1">자동 갱신</div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("realtime")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "realtime"
                ? "bg-red-600 text-white"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Activity className="w-5 h-5" />
            실시간 (3분)
          </button>
          <button
            onClick={() => setActiveTab("today")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "today"
                ? "bg-cyan-600 text-white"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            오늘 (24h)
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "weekly"
                ? "bg-purple-600 text-white"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            주간 (7일)
          </button>
          <button
            onClick={() => setActiveTab("consensus")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "consensus"
                ? "bg-yellow-600 text-white"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
            }`}
          >
            ⭐
            강력 컨센서스
          </button>
        </div>

        {/* 주식 순위 */}
        <div className="mb-8">
          <StockRanking 
            timeWindow={
              activeTab === "realtime" ? "15min" : 
              activeTab === "today" ? "24h" : 
              "7d"
            } 
          />
        </div>

        {/* 종목 리스트 */}
        <div className="space-y-8">
          {/* 상승 예상 종목 */}
          {bullishStocks.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
                📈 상승 예상 종목 ({bullishStocks.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bullishStocks.map((stock, idx) => renderStockCard(stock, idx))}
              </div>
            </div>
          )}

          {/* 하락 예상 종목 */}
          {bearishStocks.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
                📉 하락 예상 종목 ({bearishStocks.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bearishStocks.map((stock, idx) => renderStockCard(stock, idx))}
              </div>
            </div>
          )}

          {/* 의견 분분 종목 */}
          {mixedStocks.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-400 mb-4 flex items-center gap-2">
                ⚖️ 의견 분분 종목 ({mixedStocks.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mixedStocks.map((stock, idx) => renderStockCard(stock, idx))}
              </div>
            </div>
          )}

          {stocks.length === 0 && (
            <div className="text-center py-20">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full" />
                <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <Activity className="w-12 h-12 text-cyan-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-slate-300 text-xl font-medium mb-2">
                {activeTab === "realtime" && "최근 3분간 데이터 수집 중"}
                {activeTab === "today" && "오늘 데이터 수집 중"}
                {activeTab === "weekly" && "주간 데이터 수집 중"}
                {activeTab === "consensus" && "컨센서스 분석 중"}
              </p>
              <p className="text-slate-500 text-sm">전문가들의 의견을 분석하고 있습니다...</p>
              <div className="mt-6 flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 푸터 */}
      <footer className="relative border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-cyan-300 font-bold text-lg mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                TREND HACKER
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                200명의 검증된 투자 전문가의 실시간 인사이트를 한눈에
              </p>
            </div>

            <div>
              <h4 className="text-slate-300 font-semibold mb-4">데이터 소스</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>Twitter · Reddit · StockTwits</li>
                <li>3분 간격 자동 업데이트</li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-300 font-semibold mb-4">신뢰성 기준</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>팔로워 50,000+ · 인증 필수</li>
                <li>AI 감성 분석 · 전문성 검증</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            © 2025 TREND HACKER. Powered by AI & Real-time Data Streams.
          </div>
        </div>
      </footer>
    </div>
  );
}
