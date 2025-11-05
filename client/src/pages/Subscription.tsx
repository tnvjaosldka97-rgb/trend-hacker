import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Subscription() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const subscriptionQuery = trpc.subscription.getCurrent.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const subscribeMutation = trpc.subscription.subscribe.useMutation({
    onSuccess: () => {
      toast.success("구독이 완료되었습니다!");
      utils.subscription.getCurrent.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "구독에 실패했습니다.");
    },
  });

  const currentPlan = subscriptionQuery.data?.plan || "free";

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      icon: Sparkles,
      color: "slate",
      features: [
        "실시간 종목 트렌드 확인",
        "전문가 의견 요약 (최대 5개)",
        "ETF 보유종목 조회",
        "광고 표시",
      ],
      limitations: [
        "AI 리포트 미제공",
        "알림 기능 제한",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: 9900,
      icon: Zap,
      color: "cyan",
      popular: true,
      features: [
        "Free 플랜 모든 기능",
        "주간 AI 리포트 (간단한 요약, 1-2페이지)",
        "전문가 의견 무제한 조회",
        "실시간 알림 (종목 급등/급락)",
        "광고 제거",
        "포트폴리오 중복 분석",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: 29000,
      icon: Crown,
      color: "yellow",
      features: [
        "Pro 플랜 모든 기능",
        "일간 심층 AI 리포트 (상세 분석, 3-5페이지)",
        "개인 맞춤형 종목 추천",
        "전문가 1:1 상담 (월 1회)",
        "API 액세스 (데이터 다운로드)",
        "우선 고객 지원",
      ],
    },
  ];

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (planId === "free") {
      toast.info("이미 Free 플랜을 사용 중입니다.");
      return;
    }

    subscribeMutation.mutate({ plan: planId as "pro" | "premium" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-cyan-300 mb-2">AI 리포트 구독</h1>
            <p className="text-slate-400">
              전문가 의견을 AI가 분석한 맞춤형 리포트를 받아보세요
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Current Plan */}
        {isAuthenticated && (
          <div className="mb-12 text-center">
            <p className="text-sm text-slate-400 mb-2">현재 플랜</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600/20 border border-cyan-500/50 rounded-lg">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-cyan-300">
                {plans.find((p) => p.id === currentPlan)?.name || "Free"}
              </span>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative p-8 bg-slate-900/50 border-2 transition-all hover:scale-105 ${
                  plan.popular
                    ? "border-cyan-500 shadow-lg shadow-cyan-500/20"
                    : "border-slate-800"
                } ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-600 text-white text-sm font-bold rounded-full">
                    인기
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                    현재 플랜
                  </div>
                )}

                <div className="text-center mb-6">
                  <Icon
                    className={`w-12 h-12 mx-auto mb-4 text-${plan.color}-400`}
                  />
                  <h3 className={`text-2xl font-bold mb-2 text-${plan.color}-300`}>
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-white mb-1">
                    {plan.price === 0 ? (
                      "무료"
                    ) : (
                      <>
                        ₩{plan.price.toLocaleString()}
                        <span className="text-lg text-slate-400">/월</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations?.map((limitation, index) => (
                    <li key={`limit-${index}`} className="flex items-start gap-2 opacity-50">
                      <span className="text-sm text-slate-500">✗ {limitation}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || subscribeMutation.isPending}
                  className={`w-full ${
                    plan.popular
                      ? "bg-cyan-600 hover:bg-cyan-700"
                      : "bg-slate-700 hover:bg-slate-600"
                  } ${isCurrentPlan ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isCurrentPlan
                    ? "현재 사용 중"
                    : plan.price === 0
                    ? "무료로 시작하기"
                    : "구독하기"}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-cyan-300 mb-8 text-center">
            자주 묻는 질문
          </h2>
          <div className="space-y-6">
            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <h3 className="font-bold text-white mb-2">AI 리포트는 어떻게 생성되나요?</h3>
              <p className="text-sm text-slate-400">
                500명 이상의 검증된 전문가 의견을 AI가 실시간으로 분석하여, 종목별 컨센서스, 시장 트렌드, 리스크 요인 등을 종합한 리포트를 생성합니다.
              </p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <h3 className="font-bold text-white mb-2">구독 취소는 언제든지 가능한가요?</h3>
              <p className="text-sm text-slate-400">
                네, 언제든지 구독을 취소할 수 있습니다. 취소 시 다음 결제일까지는 서비스를 계속 이용하실 수 있습니다.
              </p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <h3 className="font-bold text-white mb-2">결제 수단은 무엇을 지원하나요?</h3>
              <p className="text-sm text-slate-400">
                신용카드, 체크카드, 계좌이체를 지원합니다. 안전한 결제를 위해 PG사를 통해 처리됩니다.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
