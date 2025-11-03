import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Zap, Youtube, Twitter, BarChart3, Clock, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function Home() {
  const [, setLocation] = useLocation();

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
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600"
          >
            대시보드 보기
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-cyan-500/10 blur-3xl" />
        
        <div className="relative z-10">
          <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30" variant="outline">
            미국 주식 전문가 30명의 최신 정보
          </Badge>
          <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            주식 정보를 한 곳에서
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            유명 유튜버와 트위터 전문가들의 최신 콘텐츠를 매일 자동으로 수집합니다.
            더 이상 일일이 찾아다닐 필요 없습니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setLocation("/dashboard")} 
              className="text-lg px-8 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600"
            >
              <Zap className="mr-2 h-5 w-5" />
              지금 시작하기
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-border/50">
              더 알아보기
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur hover:shadow-xl hover:shadow-cyan-500/10 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-400">
                  <Users className="h-5 w-5" />
                  30명
                </CardTitle>
                <CardDescription>검증된 전문가</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur hover:shadow-xl hover:shadow-emerald-500/10 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400">
                  <Clock className="h-5 w-5" />
                  매일 업데이트
                </CardTitle>
                <CardDescription>최신 정보 자동 수집</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur hover:shadow-xl hover:shadow-purple-500/10 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Zap className="h-5 w-5" />
                  10만원 이하
                </CardTitle>
                <CardDescription>합리적인 구독료</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          주요 기능
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur hover:shadow-2xl hover:shadow-red-500/10 transition-all group">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-red-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Youtube className="h-6 w-6 text-red-500" />
              </div>
              <CardTitle className="text-xl">유튜브 전문가 10명</CardTitle>
              <CardDescription className="text-base">
                Graham Stephan, Meet Kevin 등 구독자 수백만의 인기 유튜버들의 최신 영상을 매일 수집합니다.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur hover:shadow-2xl hover:shadow-blue-500/10 transition-all group">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Twitter className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle className="text-xl">트위터 전문가 20명</CardTitle>
              <CardDescription className="text-base">
                실시간 시장 분석과 트레이딩 전략을 공유하는 트위터 인플루언서들의 트윗을 자동 수집합니다.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur hover:shadow-2xl hover:shadow-emerald-500/10 transition-all group">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-emerald-500" />
              </div>
              <CardTitle className="text-xl">스마트 필터링</CardTitle>
              <CardDescription className="text-base">
                플랫폼별, 전문가별, 키워드별로 원하는 정보만 골라서 볼 수 있습니다.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur hover:shadow-2xl hover:shadow-purple-500/10 transition-all group">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle className="text-xl">시간 절약</CardTitle>
              <CardDescription className="text-base">
                30명의 전문가를 일일이 팔로우하고 확인할 필요 없이 한 곳에서 모든 정보를 확인하세요.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            왜 Stock Influencer Hub인가?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-cyan-400" />
              </div>
              <h4 className="text-xl font-bold mb-2">검증된 전문가</h4>
              <p className="text-muted-foreground">
                수백만 팔로워를 보유한 검증된 투자 전문가만 선별
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold mb-2">자동화 시스템</h4>
              <p className="text-muted-foreground">
                매일 최신 콘텐츠를 자동으로 수집하여 제공
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
              <h4 className="text-xl font-bold mb-2">합리적인 가격</h4>
              <p className="text-muted-foreground">
                월 10만원 이하로 30명의 전문가 정보 접근
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-cyan-500/20 border-cyan-500/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-4xl bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              지금 바로 시작하세요
            </CardTitle>
            <CardDescription className="text-lg text-foreground/80">
              주린이도 쉽게 접근할 수 있는 미국 주식 정보 허브
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              size="lg" 
              onClick={() => setLocation("/dashboard")} 
              className="text-lg px-8 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600"
            >
              대시보드로 이동
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-xl py-8">
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
