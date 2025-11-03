import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Youtube, Twitter, Search, TrendingUp, ExternalLink, Clock, Eye, Heart, Activity, BarChart3, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "youtube" | "twitter">("all");
  const [selectedInfluencer, setSelectedInfluencer] = useState<number | "all">("all");

  const { data: influencers, isLoading: influencersLoading } = trpc.influencers.list.useQuery();
  const { data: contentsData, isLoading: contentsLoading } = trpc.contents.withInfluencer.useQuery({ limit: 100 });

  const filteredContents = contentsData?.filter((item) => {
    if (!item.content) return false;
    
    if (selectedPlatform !== "all" && item.content.platform !== selectedPlatform) {
      return false;
    }
    
    if (selectedInfluencer !== "all" && item.content.influencerId !== selectedInfluencer) {
      return false;
    }
    
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      const title = item.content.title?.toLowerCase() || "";
      const description = item.content.description?.toLowerCase() || "";
      return title.includes(keyword) || description.includes(keyword);
    }
    
    return true;
  }) || [];

  // Chart data
  const platformData = [
    { name: 'YouTube', value: influencers?.filter(i => i.platform === 'youtube').length || 0, color: '#FF0000' },
    { name: 'Twitter', value: influencers?.filter(i => i.platform === 'twitter').length || 0, color: '#1DA1F2' },
  ];

  const topInfluencers = influencers
    ?.sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0))
    .slice(0, 5)
    .map(inf => ({
      name: inf.name.length > 15 ? inf.name.substring(0, 15) + '...' : inf.name,
      followers: Math.round((inf.followerCount || 0) / 1000),
    })) || [];

  const activityData = [
    { date: '11/01', youtube: 12, twitter: 45 },
    { date: '11/02', youtube: 15, twitter: 52 },
    { date: '11/03', youtube: 18, twitter: 48 },
    { date: '11/04', youtube: 14, twitter: 55 },
    { date: '11/05', youtube: 20, twitter: 60 },
    { date: '11/06', youtube: 17, twitter: 58 },
    { date: '11/07', youtube: 22, twitter: 65 },
  ];

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    return "방금 전";
  };

  const formatNumber = (num: number | null | undefined) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
              {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {APP_TITLE}
              </h1>
            </div>
            <Button variant="outline" onClick={() => setLocation("/")} className="border-border/50">
              홈으로
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-muted-foreground">전체 전문가</CardDescription>
                <Users className="h-4 w-4 text-cyan-400" />
              </div>
              <CardTitle className="text-4xl font-bold text-cyan-400">{influencers?.length || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">검증된 투자 전문가</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-muted-foreground">전체 콘텐츠</CardDescription>
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>
              <CardTitle className="text-4xl font-bold text-emerald-400">{contentsData?.length || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">수집된 최신 정보</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-muted-foreground">YouTube</CardDescription>
                <Youtube className="h-4 w-4 text-red-500" />
              </div>
              <CardTitle className="text-4xl font-bold text-red-500">
                {influencers?.filter(i => i.platform === "youtube").length || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">유튜브 채널</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-muted-foreground">Twitter</CardDescription>
                <Twitter className="h-4 w-4 text-blue-500" />
              </div>
              <CardTitle className="text-4xl font-bold text-blue-500">
                {influencers?.filter(i => i.platform === "twitter").length || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">트위터 계정</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Platform Distribution */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
                플랫폼 분포
              </CardTitle>
              <CardDescription>전문가 플랫폼별 비율</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Influencers */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                TOP 5 인플루언서
              </CardTitle>
              <CardDescription>팔로워 수 기준 (단위: K)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topInfluencers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="followers" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Activity Trend */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-400" />
              주간 활동 추이
            </CardTitle>
            <CardDescription>최근 7일간 플랫폼별 콘텐츠 업로드 수</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorYoutube" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF0000" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF0000" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTwitter" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1DA1F2" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1DA1F2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="youtube" 
                  stroke="#FF0000" 
                  fillOpacity={1} 
                  fill="url(#colorYoutube)" 
                  name="YouTube"
                />
                <Area 
                  type="monotone" 
                  dataKey="twitter" 
                  stroke="#1DA1F2" 
                  fillOpacity={1} 
                  fill="url(#colorTwitter)" 
                  name="Twitter"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Filters Section */}
        <Card className="mb-8 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-cyan-400" />
              필터 및 검색
            </CardTitle>
            <CardDescription>원하는 정보를 빠르게 찾아보세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="키워드 검색..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>

              <Select value={selectedPlatform} onValueChange={(value: any) => setSelectedPlatform(value)}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="플랫폼 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 플랫폼</SelectItem>
                  <SelectItem value="youtube">
                    <div className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-500" />
                      YouTube
                    </div>
                  </SelectItem>
                  <SelectItem value="twitter">
                    <div className="flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-blue-500" />
                      Twitter
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedInfluencer.toString()} onValueChange={(value) => setSelectedInfluencer(value === "all" ? "all" : parseInt(value))}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="전문가 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 전문가</SelectItem>
                  {influencers?.map((inf) => (
                    <SelectItem key={inf.id} value={inf.id.toString()}>
                      {inf.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              최신 콘텐츠
            </h2>
            <Badge variant="secondary" className="bg-secondary/50">{filteredContents.length}개 콘텐츠</Badge>
          </div>

          {contentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse bg-card/50 border-border/50">
                  <div className="h-48 bg-muted rounded-t-lg" />
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredContents.length === 0 ? (
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchKeyword || selectedPlatform !== "all" || selectedInfluencer !== "all"
                    ? "검색 결과가 없습니다. 필터를 조정해보세요."
                    : "아직 수집된 콘텐츠가 없습니다. 곧 최신 정보가 업데이트됩니다!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContents.map((item) => {
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
                        <Badge 
                          className="absolute top-2 right-2" 
                          variant={content.platform === "youtube" ? "destructive" : "default"}
                        >
                          {content.platform === "youtube" ? (
                            <><Youtube className="h-3 w-3 mr-1" /> YouTube</>
                          ) : (
                            <><Twitter className="h-3 w-3 mr-1" /> Twitter</>
                          )}
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {influencer?.avatarUrl && (
                          <img src={influencer.avatarUrl} alt={influencer.name} className="h-6 w-6 rounded-full" />
                        )}
                        <span className="text-sm font-medium text-muted-foreground">{influencer?.name || "Unknown"}</span>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-cyan-400 transition-colors">
                        {content.title || "제목 없음"}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {content.description || "설명이 없습니다."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-4">
                          {content.viewCount && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {formatNumber(content.viewCount)}
                            </span>
                          )}
                          {content.likeCount && (
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {formatNumber(content.likeCount)}
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(content.publishedAt)}
                        </span>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600"
                        onClick={() => window.open(content.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        원본 보기
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
