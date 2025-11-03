import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  TrendingUp,
  Rocket,
  Flame,
  BarChart3,
  Play,
  ExternalLink,
  Clock,
  Eye,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const { data: stats } = trpc.influencers.getStats.useQuery();
  const { data: contents } = trpc.contents.getLatest.useQuery({ limit: 6 });
  const { data: trendingStocks } = trpc.contents.getTrendingStocks.useQuery();
  const { data: hotKeywords } = trpc.contents.getHotKeywords.useQuery();

  const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-pink-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.15),transparent_50%)]" />
        
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Flame className="w-4 h-4" />
              실시간 업데이트 중
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                트렌드해커
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mt-6">
              모든 미장주식의 최신화된 정보를
              <br />
              <span className="text-white font-semibold">5초 안에 만날 수 있다</span>
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-4xl font-bold text-blue-400">{stats?.totalInfluencers || 30}</div>
                <div className="text-sm text-gray-400 mt-2">전문가</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-4xl font-bold text-purple-400">{stats?.totalContents || 72}</div>
                <div className="text-sm text-gray-400 mt-2">최신 콘텐츠</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-4xl font-bold text-pink-400">8</div>
                <div className="text-sm text-gray-400 mt-2">트렌딩 종목</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-4xl font-bold text-green-400">24/7</div>
                <div className="text-sm text-gray-400 mt-2">실시간 수집</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl">
                    대시보드 이동
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  무료로 시작하기
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Stocks Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">지금 가장 많이 언급되는 종목</h2>
                <p className="text-gray-400 mt-1">전문가들이 주목하는 TOP 8</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
                전체 보기
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {trendingStocks && trendingStocks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trendingStocks.slice(0, 8).map((stock: any, index: number) => (
                <Card key={stock.ticker} className="bg-white/5 backdrop-blur-sm border-white/10 p-6 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-gray-500">#{index + 1}</div>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-sm text-gray-400">{stock.count}회 언급</div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stock.ticker}</div>
                  <div className="text-sm text-gray-400">{stock.name}</div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              데이터를 불러오는 중...
            </div>
          )}
        </div>
      </section>

      {/* Hot Keywords Section */}
      <section className="py-20 bg-gray-900">
        <div className="container">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Flame className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">핫 키워드</h2>
              <p className="text-gray-400 mt-1">지금 가장 많이 언급되는 주제</p>
            </div>
          </div>

          {hotKeywords && hotKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {hotKeywords.map((keyword: any, index: number) => (
                <div
                  key={keyword.keyword}
                  className="px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                  style={{
                    fontSize: `${Math.max(14, Math.min(24, 14 + keyword.count * 2))}px`,
                  }}
                >
                  <span className="font-semibold text-white">{keyword.keyword}</span>
                  <span className="ml-2 text-gray-400 text-sm">{keyword.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              데이터를 불러오는 중...
            </div>
          )}
        </div>
      </section>

      {/* Latest Videos Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-500/10 rounded-xl">
                <Play className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">최신 영상 인사이트</h2>
                <p className="text-gray-400 mt-1">전문가들이 오늘 올린 영상</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-pink-400 hover:text-pink-300">
                전체 보기
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {contents && contents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content: any) => (
                <Card key={content.id} className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden hover:bg-white/10 transition-all group">
                  <div className="relative aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                    {content.thumbnailUrl ? (
                      <img src={content.thumbnailUrl} alt={content.title || ''} className="w-full h-full object-cover" />
                    ) : (
                      <Play className="w-16 h-16 text-white/50" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 rounded-md text-xs font-semibold">
                      YOUTUBE
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {content.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {content.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {content.publishedAt ? new Date(content.publishedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : 'N/A'}
                        </span>
                        {content.viewCount && content.viewCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {content.viewCount.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {content.url && (
                        <a
                          href={content.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                        >
                          원본 보기
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              최신 콘텐츠를 불러오는 중...
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              더 많은 인사이트를 확인하세요
            </h2>
            <p className="text-xl text-gray-400">
              전문가들의 필터링, 검색, 정렬 기능으로
              <br />
              원하는 정보를 빠르게 찾아보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg rounded-xl">
                    대시보드 이동
                  </Button>
                </Link>
              ) : (
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg rounded-xl"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  무료로 시작하기
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-white/10">
        <div className="container">
          <div className="text-center text-gray-500 text-sm">
            © 2025 {APP_TITLE}. All rights reserved.
            <div className="mt-2">
              본 서비스는 공개된 정보를 수집하여 제공합니다. 투자 결정은 사용자의 책임입니다.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
