import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Zap, Youtube, Twitter } from "lucide-react";
import { useLocation } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
          </div>
          <Button onClick={() => setLocation("/dashboard")} size="lg">
            대시보드 보기
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4" variant="secondary">
          미국 주식 전문가 30명의 최신 정보
        </Badge>
        <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          주식 정보를 한 곳에서
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          유명 유튜버와 트위터 전문가들의 최신 콘텐츠를 매일 자동으로 수집합니다.
          더 이상 일일이 찾아다닐 필요 없습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => setLocation("/dashboard")} className="text-lg px-8">
            <Zap className="mr-2 h-5 w-5" />
            지금 시작하기
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8">
            더 알아보기
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                30명
              </CardTitle>
              <CardDescription>검증된 전문가</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                매일 업데이트
              </CardTitle>
              <CardDescription>최신 정보 자동 수집</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-pink-600" />
                10만원 이하
              </CardTitle>
              <CardDescription>합리적인 구독료</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">주요 기능</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <Youtube className="h-10 w-10 text-red-600 mb-2" />
              <CardTitle>유튜브 전문가 10명</CardTitle>
              <CardDescription>
                Graham Stephan, Meet Kevin 등 구독자 수백만의 인기 유튜버들의 최신 영상을 매일 수집합니다.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <Twitter className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>트위터 전문가 20명</CardTitle>
              <CardDescription>
                실시간 시장 분석과 트레이딩 전략을 공유하는 트위터 인플루언서들의 트윗을 자동 수집합니다.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>스마트 필터링</CardTitle>
              <CardDescription>
                플랫폼별, 전문가별, 키워드별로 원하는 정보만 골라서 볼 수 있습니다.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>시간 절약</CardTitle>
              <CardDescription>
                30명의 전문가를 일일이 팔로우하고 확인할 필요 없이 한 곳에서 모든 정보를 확인하세요.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-3xl text-white">지금 바로 시작하세요</CardTitle>
            <CardDescription className="text-white/90 text-lg">
              주린이도 쉽게 접근할 수 있는 미국 주식 정보 허브
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" variant="secondary" onClick={() => setLocation("/dashboard")} className="text-lg px-8">
              대시보드로 이동
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 {APP_TITLE}. All rights reserved.</p>
          <p className="text-sm mt-2">
            본 서비스는 공개된 정보를 수집하여 제공하는 플랫폼입니다. 투자 권유가 아니며, 모든 투자 결정은 사용자 책임입니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
