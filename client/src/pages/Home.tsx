import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Youtube, Twitter, BarChart3, Clock, ExternalLink, Flame, Zap, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export default function Home() {
  const [, setLocation] = useLocation();
  
  const { data: contentsData } = trpc.contents.withInfluencer.useQuery({ limit: 50 });
  const { data: influencers } = trpc.influencers.list.useQuery();

  // 종목 키워드 분석
  const stockKeywords = ['Tesla', 'TSLA', 'Apple', 'AAPL', 'Microsoft', 'MSFT', 'Amazon', 'AMZN', 
    'Google', 'GOOGL', 'Meta', 'NVDA', 'Nvidia', 'AMD', 'Netflix', 'NFLX', 'Disney', 'DIS', 
    'Uber', 'Palantir', 'PLTR', 'Coinbase', 'Robinhood', 'S&P 500', 'SPY', 'QQQ'];
  
  const marketKeywords = ['Fed', 'Federal Reserve', 'interest rate', 'inflation', 'recession',
    'bull market', 'bear market', 'AI', 'artificial intelligence', 'earnings', 'dividend', 
    'crypto', 'bitcoin', 'ETF'];

  const { trendingStocks, hotKeywords, latestVideos } = useMemo(() => {
    if (!contentsData) return { trendingStocks: [], hotKeywords: [], latestVideos: [] };

    const stockMentions: Record<string, number> = {};
    const keywordMentions: Record<string, number> = {};

    contentsData.forEach(item => {
      const text = `${item.content?.title || ''} ${item.content?.description || ''}`.toUpperCase();
      
      stockKeywords.forEach(stock => {
        if (text.includes(stock.toUpperCase())) {
          stockMentions[stock] = (stockMentions[stock] || 0) + 1;
        }
      });
      
      marketKeywords.forEach(keyword => {
        if (text.includes(keyword.toUpperCase())) {
          keywordMentions[keyword] = (keywordMentions[keyword] || 0) + 1;
        }
      });
    });

    const sortedStocks = Object.entries(stockMentions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const sortedKeywords = Object.entries(keywordMentions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    const latest = contentsData
      .filter(item => item.content?.platform === 'youtube')
      .slice(0, 6);

    return {
      trendingStocks: sortedStocks,
      hotKeywords: sortedKeywords,
      latestVideos: latest
    };
  }, [contentsData]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    return "방금 전";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
          </div>
          <Button 
            onClick={() => setLocation("/dashboard")} 
            className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600"
          >
            전체 대시보드 →
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section with Real-time Data */}
        <section className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-cyan-500/10 blur-3xl" />
          
          <div className="relative z-10">
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30" variant="outline">
              <Flame className="h-3 w-3 mr-1" />
              실시간 업데이트 중
            </Badge>
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              지금 가장 핫한 주식 정보
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              미국 주식 전문가 30명이 지금 이 순간 다루고 있는 종목과 인사이트
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-cyan-400">{influencers?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">전문가</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-emerald-400">{contentsData?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">최신 콘텐츠</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-amber-400">{trendingStocks.length}</div>
                  <div className="text-sm text-muted-foreground">트렌딩 종목</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-purple-400">24/7</div>
                  <div className="text-sm text-muted-foreground">자동 수집</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Trending Stocks Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
              <Flame className="h-8 w-8 text-orange-500" />
              지금 가장 많이 언급되는 종목
            </h3>
            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              전체 보기 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {trendingStocks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {trendingStocks.map((stock, index) => (
                <Card 
                  key={stock.name} 
                  className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur hover:shadow-xl hover:shadow-cyan-500/10 transition-all group cursor-pointer"
                >
                  <CardContent className="pt-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                      {stock.name}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {stock.count}회 언급
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">데이터 수집 중...</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Hot Keywords Section */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2 mb-6">
            <Zap className="h-8 w-8 text-yellow-500" />
            핫 키워드
          </h3>

          {hotKeywords.length > 0 ? (
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3">
                  {hotKeywords.map((keyword) => (
                    <Badge 
                      key={keyword.name}
                      variant="secondary"
                      className="text-lg px-4 py-2 bg-secondary/50 hover:bg-secondary cursor-pointer transition-all"
                      style={{ 
                        fontSize: `${Math.min(1.5, 0.8 + keyword.count * 0.1)}rem`
                      }}
                    >
                      {keyword.name}
                      <span className="ml-2 text-cyan-400 font-bold">{keyword.count}</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">키워드 분석 중...</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Latest Videos Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
              <Youtube className="h-8 w-8 text-red-500" />
              최신 영상 인사이트
            </h3>
            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              전체 보기 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {latestVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestVideos.map((item) => {
                const content = item.content;
                const influencer = item.influencer;
                
                if (!content) return null;

                return (
                  <Card 
                    key={content.id} 
                    className="hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 overflow-hidden bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur group"
                  >
                    {content.thumbnailUrl && (
                      <div className="relative h-48 bg-muted overflow-hidden">
                        <img
                          src={content.thumbnailUrl}
                          alt={content.title || "Thumbnail"}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0">
                          <Youtube className="h-3 w-3 mr-1" /> YouTube
                        </Badge>
                        <div className="absolute bottom-2 left-2 flex items-center gap-2">
                          {influencer?.avatarUrl && (
                            <img src={influencer.avatarUrl} alt={influencer.name} className="h-6 w-6 rounded-full border-2 border-white" />
                          )}
                          <span className="text-white text-sm font-medium">{influencer?.name}</span>
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-2 group-hover:text-cyan-400 transition-colors">
                        {content.title || "제목 없음"}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {content.description || "설명이 없습니다."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(content.publishedAt)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600"
                        onClick={() => window.open(content.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        영상 보기
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
              <CardContent className="py-12 text-center">
                <Youtube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">최신 영상을 불러오는 중...</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-cyan-500/20 border-cyan-500/30 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-3xl bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                더 많은 인사이트를 확인하세요
              </CardTitle>
              <CardDescription className="text-base text-foreground/80">
                전체 대시보드에서 필터링, 검색, 차트 분석까지
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                onClick={() => setLocation("/dashboard")} 
                className="text-lg px-8 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                대시보드로 이동
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-xl py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 {APP_TITLE}. All rights reserved.</p>
          <p className="text-sm mt-2">
            본 서비스는 공개된 정보를 수집하여 제공하는 플랫폼입니다. 투자 권유가 아니며, 모든 투자 결정은 사용자 책임입니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
