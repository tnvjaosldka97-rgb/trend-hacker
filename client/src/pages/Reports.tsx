import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { FileText, Lock, Calendar, Sparkles, Send, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Streamdown } from "streamdown";
import { Link } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Reports() {
  const { user, isAuthenticated } = useAuth();
  
  const subscriptionQuery = trpc.subscription.getCurrent.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const reportsQuery = trpc.subscription.getReports.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const currentPlan = subscriptionQuery.data?.plan || "free";
  const reports = reportsQuery.data || [];
  
  const [requestTopic, setRequestTopic] = useState("");
  const [requestTicker, setRequestTicker] = useState("");
  
  const onDemandStatusQuery = trpc.subscription.getOnDemandStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const requestReportMutation = trpc.subscription.requestOnDemand.useMutation({
    onSuccess: (data) => {
      toast.success(`리포트가 생성되었습니다! ${data.remaining >= 0 ? `(남은 횟수: ${data.remaining}회)` : ''}`);
      setRequestTopic("");
      setRequestTicker("");
      reportsQuery.refetch();
      onDemandStatusQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "리포트 생성에 실패했습니다.");
    },
  });
  
  const handleRequestReport = () => {
    if (!requestTopic.trim()) {
      toast.error("주제를 입력해주세요.");
      return;
    }
    
    requestReportMutation.mutate({
      topic: requestTopic,
      ticker: requestTicker || undefined,
    });
  };
  
  const onDemandStatus = onDemandStatusQuery.data || { plan: 'free', used: 0, limit: 0, remaining: 0 };

  // Free plan users see locked message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <Card className="p-8 bg-slate-900/50 border-slate-800 max-w-md text-center">
          <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cyan-300 mb-4">로그인이 필요합니다</h2>
          <p className="text-slate-400 mb-6">
            AI 리포트를 확인하려면 로그인해주세요.
          </p>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            로그인하기
          </Button>
        </Card>
      </div>
    );
  }

  if (currentPlan === "free") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <Card className="p-8 bg-slate-900/50 border-slate-800 max-w-md text-center">
          <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cyan-300 mb-4">구독이 필요합니다</h2>
          <p className="text-slate-400 mb-6">
            AI 리포트는 Pro 또는 Premium 플랜에서만 이용할 수 있습니다.
          </p>
          <Link href="/subscription">
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              구독 플랜 보기
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-3xl font-bold text-cyan-300">AI 리포트</h1>
                <p className="text-sm text-slate-400">
                  {currentPlan === "pro" ? "주간 AI 리포트" : "일간 심층 AI 리포트"}
                </p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-slate-700">
                홈으로
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* On-Demand Report Request */}
        {(currentPlan === 'pro' || currentPlan === 'premium') && (
          <Card className="p-6 bg-slate-900/50 border-cyan-500/30 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Send className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-cyan-300">온디맨드 리포트 요청</h2>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-2">
                {onDemandStatus.plan === 'pro' 
                  ? `월 ${onDemandStatus.limit}회 사용 가능 (남은 횟수: ${onDemandStatus.remaining}회)`
                  : '무제한 사용 가능'}
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">주제 *</label>
                  <Input
                    placeholder="예: 이번 주 테슬라 분석"
                    value={requestTopic}
                    onChange={(e) => setRequestTopic(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">종목 티커 (선택)</label>
                  <Input
                    placeholder="예: TSLA"
                    value={requestTicker}
                    onChange={(e) => setRequestTicker(e.target.value.toUpperCase())}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
              </div>
              <Button
                onClick={handleRequestReport}
                disabled={requestReportMutation.isPending || (onDemandStatus.plan === 'pro' && onDemandStatus.remaining <= 0)}
                className="bg-cyan-600 hover:bg-cyan-700 w-full md:w-auto"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {requestReportMutation.isPending ? '생성 중...' : '리포트 요청하기'}
              </Button>
            </div>
            
            <div className="text-xs text-slate-500 mt-4">
              <p>팁: "이번 주 테슬라 분석", "엔비디아 최근 동향", "나스닥 100 주간 요약" 등으로 요청해보세요.</p>
            </div>
          </Card>
        )}
        
        {reportsQuery.isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-400">리포트 로딩 중...</p>
          </div>
        )}

        {reports.length === 0 && !reportsQuery.isLoading && (
          <Card className="p-8 bg-slate-900/50 border-slate-800 text-center">
            <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">
              아직 생성된 리포트가 없습니다
            </h3>
            <p className="text-sm text-slate-400">
              {currentPlan === "pro" 
                ? "매주 월요일 오전 9시에 새로운 리포트가 생성됩니다." 
                : "매일 오전 9시에 새로운 리포트가 생성됩니다."}
            </p>
          </Card>
        )}

        {/* Reports List */}
        <div className="grid gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="p-6 bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h3 className="text-xl font-bold text-cyan-300">{report.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(report.reportDate).toLocaleDateString('ko-KR')}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-cyan-400 font-medium">
                        {report.planType === "pro" ? "Pro" : "Premium"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Report Content */}
              <div className="prose prose-invert max-w-none">
                <Streamdown>{report.content}</Streamdown>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
