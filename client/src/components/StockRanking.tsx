import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface StockRankingProps {
  timeWindow: '15min' | '24h' | '7d';
}

export default function StockRanking({ timeWindow }: StockRankingProps) {
  const { data: stocks, isLoading } = trpc.stocks.getTopStocks.useQuery({ 
    timeWindow, 
    limit: 10 
  });

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-cyan-500/20 rounded animate-pulse" />
          <div className="h-6 w-40 bg-cyan-500/20 rounded animate-pulse" />
        </div>
        
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700/50" />
                  <div>
                    <div className="h-5 w-16 bg-slate-700/50 rounded mb-1" />
                    <div className="h-3 w-20 bg-slate-700/30 rounded" />
                  </div>
                </div>
                <div className="h-6 w-24 bg-slate-700/50 rounded-full" />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-700/30" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-700/50 rounded-full" />
                  <div className="h-8 bg-slate-700/30 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-cyan-400">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">데이터 수집 대기 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!stocks || stocks.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">📊 TOP 10 언급 종목</h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-slate-700 rounded-full" />
            <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-400 text-lg font-medium mb-2">데이터 수집 대기 중</p>
          <p className="text-slate-500 text-sm">전문가들의 의견을 분석하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
      <h3 className="text-xl font-bold text-cyan-400 mb-4">📊 TOP 10 언급 종목</h3>
      
      <div className="space-y-3">
        {stocks.map((stock, index) => {
          const total = stock.bullishCount + stock.bearishCount + stock.neutralCount;
          const bullishPercent = total > 0 ? Math.round((stock.bullishCount / total) * 100) : 0;
          const bearishPercent = total > 0 ? Math.round((stock.bearishCount / total) * 100) : 0;
          const neutralPercent = total > 0 ? Math.round((stock.neutralCount / total) * 100) : 0;
          
          // 주요 의견 결정
          let mainSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
          if (bullishPercent > bearishPercent && bullishPercent > neutralPercent) {
            mainSentiment = 'bullish';
          } else if (bearishPercent > bullishPercent && bearishPercent > neutralPercent) {
            mainSentiment = 'bearish';
          }
          
          return (
            <div 
              key={stock.ticker}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:border-cyan-500/30 transition-all"
            >
              {/* 헤더: 순위 + 티커 + 언급 횟수 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : ''}
                    ${index === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' : ''}
                    ${index === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : ''}
                    ${index >= 3 ? 'bg-slate-700/50 text-slate-400' : ''}
                  `}>
                    {index + 1}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{stock.ticker}</span>
                      {mainSentiment === 'bullish' && <TrendingUp className="w-4 h-4 text-green-400" />}
                      {mainSentiment === 'bearish' && <TrendingDown className="w-4 h-4 text-red-400" />}
                      {mainSentiment === 'neutral' && <Minus className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div className="text-xs text-slate-400">
                      {stock.mentionCount}회 언급
                    </div>
                  </div>
                </div>
                
                {/* 주요 의견 배지 */}
                <div className={`
                  px-3 py-1 rounded-full text-xs font-semibold
                  ${mainSentiment === 'bullish' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : ''}
                  ${mainSentiment === 'bearish' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : ''}
                  ${mainSentiment === 'neutral' ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' : ''}
                `}>
                  {mainSentiment === 'bullish' && `🔥 상승 ${bullishPercent}%`}
                  {mainSentiment === 'bearish' && `📉 하락 ${bearishPercent}%`}
                  {mainSentiment === 'neutral' && `⚖️ 중립 ${neutralPercent}%`}
                </div>
              </div>
              
              {/* 파이 차트 + 의견 비율 바 */}
              <div className="flex items-center gap-4">
                {/* 파이 차트 */}
                <div className="w-20 h-20 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: '상승', value: bullishPercent, color: '#10b981' },
                          { name: '하락', value: bearishPercent, color: '#ef4444' },
                          { name: '중립', value: neutralPercent, color: '#64748b' },
                        ].filter(d => d.value > 0)}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={12}
                        outerRadius={32}
                        paddingAngle={2}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                        <Cell fill="#64748b" />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* 의견 비율 바 */}
                <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 h-3 rounded-full overflow-hidden bg-slate-700/50">
                  {bullishPercent > 0 && (
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                      style={{ width: `${bullishPercent}%` }}
                    />
                  )}
                  {bearishPercent > 0 && (
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-rose-400"
                      style={{ width: `${bearishPercent}%` }}
                    />
                  )}
                  {neutralPercent > 0 && (
                    <div 
                      className="h-full bg-gradient-to-r from-slate-500 to-slate-400"
                      style={{ width: `${neutralPercent}%` }}
                    />
                  )}
                </div>
                
                {/* 의견 비율 상세 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-green-400">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    상승 {bullishPercent}%
                  </div>
                  <div className="flex items-center gap-1 text-red-400">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    하락 {bearishPercent}%
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    중립 {neutralPercent}%
                  </div>
                </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
