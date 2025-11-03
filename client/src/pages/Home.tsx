import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Clock, Activity, BarChart3, Zap, Users, MessageSquare, Target, Award, ExternalLink } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("realtime");
  
  const realtimeQuery = trpc.trending.realtime.useQuery(undefined, {
    refetchInterval: 15 * 60 * 1000,
  });
  
  const todayQuery = trpc.trending.today.useQuery();
  const weeklyQuery = trpc.trending.weekly.useQuery();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* IT Tech Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/bg-tech.png)',
          filter: 'brightness(0.4)'
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-slate-950/80 via-slate-900/70 to-slate-950/90" />

      {/* Header */}
      <header className="relative z-10 border-b border-cyan-500/20 bg-slate-900/60 backdrop-blur-md sticky top-0 shadow-lg shadow-cyan-500/5">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <Zap className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-lg">
                  TREND HACKER
                </h1>
              </div>
              <p className="text-sm text-cyan-300/80 mt-1 font-medium">200명의 전문가 | 실시간 데이터 스트림</p>
            </div>
            <LiveTimer lastUpdate={realtimeQuery.data?.lastUpdate} nextUpdate={realtimeQuery.data?.nextUpdate} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <HeroStatCard 
            icon={<Users className="w-6 h-6" />}
            title="전문가"
            value="200+"
            subtitle="검증된 계정"
            color="cyan"
          />
          <HeroStatCard 
            icon={<MessageSquare className="w-6 h-6" />}
            title="트윗"
            value={todayQuery.data?.totalTweets || 0}
            subtitle="오늘 수집"
            color="blue"
          />
          <HeroStatCard 
            icon={<Target className="w-6 h-6" />}
            title="종목"
            value={todayQuery.data?.stocks.length || 0}
            subtitle="추적 중"
            color="purple"
          />
          <HeroStatCard 
            icon={<Activity className="w-6 h-6" />}
            title="업데이트"
            value="15분"
            subtitle="자동 갱신"
            color="pink"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/60 border border-cyan-500/20 backdrop-blur-md p-1 shadow-lg">
            <TabsTrigger 
              value="realtime" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-500/50"
            >
              <Activity className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">🔴 실시간</span>
              <span className="sm:hidden">🔴</span>
              <span className="text-xs ml-1">(15분)</span>
            </TabsTrigger>
            <TabsTrigger 
              value="today"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50"
            >
              <Clock className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">📊 오늘</span>
              <span className="sm:hidden">📊</span>
              <span className="text-xs ml-1">(24h)</span>
            </TabsTrigger>
            <TabsTrigger 
              value="weekly"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/50"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">📈 주간</span>
              <span className="sm:hidden">📈</span>
              <span className="text-xs ml-1">(7일)</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="space-y-6">
            <RealtimeView data={realtimeQuery.data} isLoading={realtimeQuery.isLoading} />
          </TabsContent>

          <TabsContent value="today" className="space-y-6">
            <TodayView data={todayQuery.data} isLoading={todayQuery.isLoading} />
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <WeeklyView data={weeklyQuery.data} isLoading={weeklyQuery.isLoading} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-500/20 bg-slate-900/60 backdrop-blur-md mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-cyan-300 font-bold mb-2 flex items-center gap-2 justify-center md:justify-start">
                <Zap className="w-5 h-5" />
                TREND HACKER
              </h3>
              <p className="text-slate-400 text-sm">
                200명의 검증된 투자 전문가의<br />실시간 인사이트를 한눈에
              </p>
            </div>
            <div>
              <h3 className="text-cyan-300 font-bold mb-2">데이터 소스</h3>
              <p className="text-slate-400 text-sm">
                Twitter · Reddit · StockTwits<br />
                15분 간격 자동 업데이트
              </p>
            </div>
            <div>
              <h3 className="text-cyan-300 font-bold mb-2">신뢰성 기준</h3>
              <p className="text-slate-400 text-sm">
                팔로워 5,000+ · 인증 계정<br />
                AI 감성 분석 · 참여도 필터링
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center text-slate-500 text-sm">
            © 2025 TREND HACKER. Powered by AI & Real-time Data Streams.
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroStatCard({ icon, title, value, subtitle, color }: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  subtitle: string; 
  color: string;
}) {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-300 shadow-cyan-500/20',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-300 shadow-blue-500/20',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-300 shadow-purple-500/20',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-300 shadow-pink-500/20',
  };

  const classes = colorClasses[color as keyof typeof colorClasses];

  return (
    <Card className={`bg-gradient-to-br ${classes} border backdrop-blur-md shadow-lg`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={`${classes.split(' ')[4]}`}>{icon}</div>
          <p className="text-xs text-slate-400 font-medium">{title}</p>
        </div>
        <p className={`text-2xl md:text-3xl font-bold ${classes.split(' ')[4]} font-mono`}>{value}</p>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function LiveTimer({ lastUpdate, nextUpdate }: { lastUpdate?: Date; nextUpdate?: Date }) {
  const [timeAgo, setTimeAgo] = useState("");
  const [timeUntil, setTimeUntil] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdate) {
        const seconds = Math.floor((Date.now() - new Date(lastUpdate).getTime()) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        setTimeAgo(`${minutes}:${remainingSeconds.toString().padStart(2, '0')}`);
      }
      
      if (nextUpdate) {
        const seconds = Math.floor((new Date(nextUpdate).getTime() - Date.now()) / 1000);
        if (seconds > 0) {
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          setTimeUntil(`${minutes}:${remainingSeconds.toString().padStart(2, '0')}`);
        } else {
          setTimeUntil("00:00");
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate, nextUpdate]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs sm:text-sm bg-slate-800/60 backdrop-blur-md border border-cyan-500/20 rounded-lg px-4 py-3 shadow-lg shadow-cyan-500/10">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
        <span className="text-slate-400">LAST UPDATE</span>
        <span className="text-cyan-300 font-mono font-bold text-base drop-shadow-[0_0_4px_rgba(34,211,238,0.6)]">{timeAgo || "--:--"}</span>
      </div>
      <div className="hidden sm:block w-px h-6 bg-slate-700" />
      <div className="flex items-center gap-2">
        <Clock className="w-3 h-3 text-slate-400" />
        <span className="text-slate-400">NEXT UPDATE</span>
        <span className="text-cyan-300 font-mono font-bold text-base drop-shadow-[0_0_4px_rgba(34,211,238,0.6)]">{timeUntil || "--:--"}</span>
      </div>
    </div>
  );
}

function getRelativeTime(date: Date | string | null): string {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${diffDays}일 전`;
}

function RealtimeView({ data, isLoading }: { data?: any; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-cyan-300 animate-pulse text-lg drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">데이터 로딩 중...</div>
      </div>
    );
  }

  if (!data || data.stocks.length === 0) {
    return (
      <Card className="bg-slate-800/60 border-cyan-500/20 backdrop-blur-md shadow-xl">
        <CardContent className="py-20 text-center">
          <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 text-lg font-medium">최근 15분간 종목 언급이 없습니다</p>
          <p className="text-slate-500 text-sm mt-2">데이터 수집 대기 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="MENTIONS" value={data.totalTweets} subtitle="Last 15min" color="cyan" />
        <StatCard title="STOCKS" value={data.stocks.length} subtitle="Unique" color="purple" />
        <StatCard 
          title="AVG" 
          value={data.stocks.length > 0 ? (data.totalTweets / data.stocks.length).toFixed(1) : 0} 
          subtitle="Per stock" 
          color="pink" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.stocks.map((stock: any, index: number) => (
          <StockCard key={stock.ticker} stock={stock} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}

function TodayView({ data, isLoading }: { data?: any; isLoading: boolean }) {
  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="text-cyan-300 animate-pulse text-lg drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">데이터 로딩 중...</div></div>;
  }

  if (!data || data.stocks.length === 0) {
    return (
      <Card className="bg-slate-800/60 border-cyan-500/20 backdrop-blur-md shadow-xl">
        <CardContent className="py-20 text-center">
          <p className="text-slate-300 text-lg">오늘 데이터가 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  const bullishStocks = data.stocks.filter((s: any) => s.sentiment === 'bullish');
  const bearishStocks = data.stocks.filter((s: any) => s.sentiment === 'bearish');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="TWEETS" value={data.totalTweets} color="cyan" />
        <StatCard title="STOCKS" value={data.stocks.length} color="purple" />
        <StatCard title="BULLISH" value={bullishStocks.length} color="green" />
        <StatCard title="BEARISH" value={bearishStocks.length} color="red" />
      </div>

      {bullishStocks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]">
            <TrendingUp className="w-5 h-5" />
            상승 예상 종목 ({bullishStocks.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {bullishStocks.map((stock: any, index: number) => (
              <StockCard key={stock.ticker} stock={stock} rank={index + 1} />
            ))}
          </div>
        </div>
      )}

      {bearishStocks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]">
            <TrendingDown className="w-5 h-5" />
            하락 예상 종목 ({bearishStocks.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {bearishStocks.map((stock: any, index: number) => (
              <StockCard key={stock.ticker} stock={stock} rank={index + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WeeklyView({ data, isLoading }: { data?: any; isLoading: boolean }) {
  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="text-cyan-300 animate-pulse text-lg drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">데이터 로딩 중...</div></div>;
  }

  if (!data || data.stocks.length === 0) {
    return (
      <Card className="bg-slate-800/60 border-cyan-500/20 backdrop-blur-md shadow-xl">
        <CardContent className="py-20 text-center">
          <p className="text-slate-300 text-lg">이번 주 데이터가 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="TWEETS" value={data.totalTweets} subtitle="Last 7 days" color="cyan" />
        <StatCard title="DAILY AVG" value={Math.round(data.totalTweets / 7)} subtitle="Tweets/day" color="purple" />
        <StatCard title="STOCKS" value={data.stocks.length} subtitle="Tracked" color="pink" />
      </div>

      {/* Weekly Best */}
      {data.stocks.length > 0 && (
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 backdrop-blur-md shadow-xl shadow-yellow-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-300">
              <Award className="w-6 h-6" />
              주간 베스트 종목
            </CardTitle>
            <CardDescription className="text-slate-400">
              가장 많이 언급된 TOP 3
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.stocks.slice(0, 3).map((stock: any, index: number) => (
                <div key={stock.ticker} className="flex items-center justify-between bg-slate-900/40 p-4 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-lg font-bold px-3">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="text-xl font-bold text-yellow-300 font-mono">${stock.ticker}</p>
                      <p className="text-xs text-slate-400">{stock.count}회 언급</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">일평균</p>
                    <p className="text-lg font-bold text-cyan-300 font-mono">{stock.avgPerDay}/일</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.stocks.slice(0, 20).map((stock: any, index: number) => (
          <StockCard key={stock.ticker} stock={stock} rank={index + 1} showAvg />
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }: { title: string; value: number | string; subtitle?: string; color: string }) {
  const colorClasses = {
    cyan: 'border-cyan-500/40 bg-slate-800/60 text-cyan-300 shadow-cyan-500/20',
    purple: 'border-purple-500/40 bg-slate-800/60 text-purple-300 shadow-purple-500/20',
    pink: 'border-pink-500/40 bg-slate-800/60 text-pink-300 shadow-pink-500/20',
    green: 'border-green-500/40 bg-slate-800/60 text-green-300 shadow-green-500/20',
    red: 'border-red-500/40 bg-slate-800/60 text-red-300 shadow-red-500/20',
  };

  const classes = colorClasses[color as keyof typeof colorClasses];

  return (
    <Card className={`${classes} border backdrop-blur-md shadow-lg`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs text-slate-400 font-mono">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-4xl font-bold ${classes.split(' ')[2]} font-mono drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function StockCard({ stock, rank, showAvg = false }: { stock: any; rank: number; showAvg?: boolean }) {
  const sentimentConfig = {
    bullish: {
      border: 'border-green-500/50',
      bg: 'bg-slate-800/60',
      text: 'text-green-300',
      icon: <TrendingUp className="w-5 h-5" />,
      badge: 'bg-green-500/20 text-green-300 border-green-500/30',
      shadow: 'shadow-green-500/20'
    },
    bearish: {
      border: 'border-red-500/50',
      bg: 'bg-slate-800/60',
      text: 'text-red-300',
      icon: <TrendingDown className="w-5 h-5" />,
      badge: 'bg-red-500/20 text-red-300 border-red-500/30',
      shadow: 'shadow-red-500/20'
    },
    neutral: {
      border: 'border-slate-600',
      bg: 'bg-slate-800/60',
      text: 'text-slate-300',
      icon: <Activity className="w-5 h-5" />,
      badge: 'bg-slate-700/50 text-slate-300 border-slate-600',
      shadow: 'shadow-slate-500/20'
    }
  };

  const config = sentimentConfig[stock.sentiment as keyof typeof sentimentConfig] || sentimentConfig.neutral;
  const bullishPercent = stock.count > 0 ? Math.round((stock.bullish / stock.count) * 100) : 0;
  const bearishPercent = stock.count > 0 ? Math.round((stock.bearish / stock.count) * 100) : 0;

  return (
    <Card className={`${config.bg} ${config.border} border backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-xl ${config.shadow}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`${config.badge} border text-lg font-bold font-mono px-3 py-1`}>
              #{rank}
            </Badge>
            <CardTitle className={`text-3xl font-bold ${config.text} font-mono drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]`}>
              ${stock.ticker}
            </CardTitle>
          </div>
          <div className={config.text}>
            {config.icon}
          </div>
        </div>
        <CardDescription className="text-slate-400 font-mono text-sm">
          {stock.count} MENTIONS
          {showAvg && ` • AVG ${stock.avgPerDay}/DAY`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-green-400 drop-shadow-[0_0_4px_rgba(74,222,128,0.4)]">▲ {stock.bullish} ({bullishPercent}%)</span>
            <span className="text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.4)]">▼ {stock.bearish} ({bearishPercent}%)</span>
          </div>
          <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden flex border border-slate-700/30">
            <div className="bg-gradient-to-r from-green-500 to-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" style={{ width: `${bullishPercent}%` }} />
            <div className="bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]" style={{ width: `${bearishPercent}%` }} />
          </div>
        </div>

        {stock.latestTweet && (
          <div className="space-y-2">
            <div className="text-sm text-slate-200 bg-slate-900/60 border border-slate-700/30 p-3 rounded leading-relaxed">
              <span className="text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.6)]">→</span> {stock.latestTweet}
            </div>
            
            {/* Source Info */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                {stock.latestTweetAuthor && (
                  <span className="text-cyan-400 font-medium">@{stock.latestTweetAuthor}</span>
                )}
                {stock.latestTweetTime && (
                  <span>• {getRelativeTime(stock.latestTweetTime)}</span>
                )}
              </div>
              {stock.latestTweetUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                  onClick={() => window.open(stock.latestTweetUrl, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  원문
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
