import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, Activity, BarChart3, Zap } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("realtime");
  
  const realtimeQuery = trpc.trending.realtime.useQuery(undefined, {
    refetchInterval: 15 * 60 * 1000,
  });
  
  const todayQuery = trpc.trending.today.useQuery();
  const weeklyQuery = trpc.trending.weekly.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Subtle Tech Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        {/* Very subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(100,200,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(100,200,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <Zap className="w-8 h-8 text-cyan-400" />
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                  TREND HACKER
                </h1>
              </div>
              <p className="text-sm text-slate-400 mt-1">200명의 전문가 | 실시간 데이터 스트림</p>
            </div>
            <LiveTimer lastUpdate={realtimeQuery.data?.lastUpdate} nextUpdate={realtimeQuery.data?.nextUpdate} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-1">
            <TabsTrigger 
              value="realtime" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white"
            >
              <Activity className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">🔴 실시간</span>
              <span className="sm:hidden">🔴</span>
              <span className="text-xs ml-1">(15분)</span>
            </TabsTrigger>
            <TabsTrigger 
              value="today"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Clock className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">📊 오늘</span>
              <span className="sm:hidden">📊</span>
              <span className="text-xs ml-1">(24h)</span>
            </TabsTrigger>
            <TabsTrigger 
              value="weekly"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
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
    </div>
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
    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs sm:text-sm bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-slate-400">LAST UPDATE</span>
        <span className="text-cyan-300 font-mono font-bold text-base">{timeAgo || "--:--"}</span>
      </div>
      <div className="hidden sm:block w-px h-6 bg-slate-700" />
      <div className="flex items-center gap-2">
        <Clock className="w-3 h-3 text-slate-400" />
        <span className="text-slate-400">NEXT UPDATE</span>
        <span className="text-cyan-300 font-mono font-bold text-base">{timeUntil || "--:--"}</span>
      </div>
    </div>
  );
}

function RealtimeView({ data, isLoading }: { data?: any; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-cyan-300 animate-pulse text-lg">데이터 로딩 중...</div>
      </div>
    );
  }

  if (!data || data.stocks.length === 0) {
    return (
      <Card className="bg-slate-800/90 border-slate-700/50 backdrop-blur-sm">
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
    return <div className="flex items-center justify-center py-20"><div className="text-cyan-300 animate-pulse text-lg">데이터 로딩 중...</div></div>;
  }

  if (!data || data.stocks.length === 0) {
    return (
      <Card className="bg-slate-800/90 border-slate-700/50 backdrop-blur-sm">
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
          <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
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
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
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
    return <div className="flex items-center justify-center py-20"><div className="text-cyan-300 animate-pulse text-lg">데이터 로딩 중...</div></div>;
  }

  if (!data || data.stocks.length === 0) {
    return (
      <Card className="bg-slate-800/90 border-slate-700/50 backdrop-blur-sm">
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
    cyan: 'border-cyan-500/40 bg-slate-800/90',
    purple: 'border-purple-500/40 bg-slate-800/90',
    pink: 'border-pink-500/40 bg-slate-800/90',
    green: 'border-green-500/40 bg-slate-800/90',
    red: 'border-red-500/40 bg-slate-800/90',
  };

  const textColors = {
    cyan: 'text-cyan-300',
    purple: 'text-purple-300',
    pink: 'text-pink-300',
    green: 'text-green-300',
    red: 'text-red-300',
  };

  return (
    <Card className={`${colorClasses[color as keyof typeof colorClasses]} border backdrop-blur-sm`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs text-slate-400 font-mono">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-4xl font-bold ${textColors[color as keyof typeof textColors]} font-mono`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function StockCard({ stock, rank, showAvg = false }: { stock: any; rank: number; showAvg?: boolean }) {
  const sentimentConfig = {
    bullish: {
      border: 'border-green-500/50',
      bg: 'bg-slate-800/90',
      text: 'text-green-300',
      icon: <TrendingUp className="w-5 h-5" />,
      badge: 'bg-green-500/20 text-green-300 border-green-500/30'
    },
    bearish: {
      border: 'border-red-500/50',
      bg: 'bg-slate-800/90',
      text: 'text-red-300',
      icon: <TrendingDown className="w-5 h-5" />,
      badge: 'bg-red-500/20 text-red-300 border-red-500/30'
    },
    neutral: {
      border: 'border-slate-600',
      bg: 'bg-slate-800/90',
      text: 'text-slate-300',
      icon: <Activity className="w-5 h-5" />,
      badge: 'bg-slate-700/50 text-slate-300 border-slate-600'
    }
  };

  const config = sentimentConfig[stock.sentiment as keyof typeof sentimentConfig] || sentimentConfig.neutral;
  const bullishPercent = stock.count > 0 ? Math.round((stock.bullish / stock.count) * 100) : 0;
  const bearishPercent = stock.count > 0 ? Math.round((stock.bearish / stock.count) * 100) : 0;

  return (
    <Card className={`${config.bg} ${config.border} border backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-lg`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`${config.badge} border text-lg font-bold font-mono px-3 py-1`}>
              #{rank}
            </Badge>
            <CardTitle className={`text-3xl font-bold ${config.text} font-mono`}>
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
            <span className="text-green-400">▲ {stock.bullish} ({bullishPercent}%)</span>
            <span className="text-red-400">▼ {stock.bearish} ({bearishPercent}%)</span>
          </div>
          <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden flex border border-slate-700/30">
            <div className="bg-gradient-to-r from-green-500 to-green-400" style={{ width: `${bullishPercent}%` }} />
            <div className="bg-gradient-to-r from-red-500 to-red-400" style={{ width: `${bearishPercent}%` }} />
          </div>
        </div>

        {stock.latestTweet && (
          <div className="text-sm text-slate-200 bg-slate-900/60 border border-slate-700/30 p-3 rounded leading-relaxed">
            <span className="text-cyan-400">→</span> {stock.latestTweet}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
