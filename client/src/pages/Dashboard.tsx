import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Youtube, Twitter, Search, Filter, TrendingUp, ExternalLink, Clock, Eye, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "youtube" | "twitter">("all");
  const [selectedInfluencer, setSelectedInfluencer] = useState<number | "all">("all");

  // Fetch influencers
  const { data: influencers, isLoading: influencersLoading } = trpc.influencers.list.useQuery();

  // Fetch contents with influencer info
  const { data: contentsData, isLoading: contentsLoading } = trpc.contents.withInfluencer.useQuery({ limit: 100 });

  // Filter contents based on selected filters
  const filteredContents = contentsData?.filter((item) => {
    if (!item.content) return false;
    
    // Platform filter
    if (selectedPlatform !== "all" && item.content.platform !== selectedPlatform) {
      return false;
    }
    
    // Influencer filter
    if (selectedInfluencer !== "all" && item.content.influencerId !== selectedInfluencer) {
      return false;
    }
    
    // Search filter
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      const title = item.content.title?.toLowerCase() || "";
      const description = item.content.description?.toLowerCase() || "";
      return title.includes(keyword) || description.includes(keyword);
    }
    
    return true;
  }) || [];

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
              {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {APP_TITLE}
              </h1>
            </div>
            <Button variant="outline" onClick={() => setLocation("/")}>
              홈으로
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              필터 및 검색
            </CardTitle>
            <CardDescription>원하는 정보를 빠르게 찾아보세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="키워드 검색..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Platform Filter */}
              <Select value={selectedPlatform} onValueChange={(value: any) => setSelectedPlatform(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="플랫폼 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 플랫폼</SelectItem>
                  <SelectItem value="youtube">
                    <div className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-600" />
                      YouTube
                    </div>
                  </SelectItem>
                  <SelectItem value="twitter">
                    <div className="flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-blue-600" />
                      Twitter
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Influencer Filter */}
              <Select value={selectedInfluencer.toString()} onValueChange={(value) => setSelectedInfluencer(value === "all" ? "all" : parseInt(value))}>
                <SelectTrigger>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>전체 전문가</CardDescription>
              <CardTitle className="text-3xl">{influencers?.length || 0}명</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>전체 콘텐츠</CardDescription>
              <CardTitle className="text-3xl">{contentsData?.length || 0}개</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>YouTube</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Youtube className="h-6 w-6 text-red-600" />
                {influencers?.filter(i => i.platform === "youtube").length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Twitter</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Twitter className="h-6 w-6 text-blue-600" />
                {influencers?.filter(i => i.platform === "twitter").length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Content Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">최신 콘텐츠</h2>
            <Badge variant="secondary">{filteredContents.length}개 콘텐츠</Badge>
          </div>

          {contentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg" />
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredContents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
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
                  <Card key={content.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                    {content.thumbnailUrl && (
                      <div className="relative h-48 bg-gray-100">
                        <img
                          src={content.thumbnailUrl}
                          alt={content.title || "Thumbnail"}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2" variant={content.platform === "youtube" ? "destructive" : "default"}>
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
                        <span className="text-sm font-medium text-gray-600">{influencer?.name || "Unknown"}</span>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{content.title || "제목 없음"}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {content.description || "설명이 없습니다."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
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
                        className="w-full"
                        variant="outline"
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
