import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, TrendingUp, TrendingDown, Award, BarChart3, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

/**
 * Expert Profile Page
 * 
 * Displays detailed information about a specific expert:
 * - Basic info (name, institution, followers)
 * - Accuracy rating and grade (S/A/B/C/D)
 * - Past predictions timeline
 * - Backtesting results
 * - Recent content
 */

export default function ExpertProfile() {
  const [, params] = useRoute("/expert/:id");
  const expertId = params?.id ? parseInt(params.id) : 0;

  const { data: influencer, isLoading: influencerLoading } = trpc.influencers.byId.useQuery(
    { id: expertId },
    { enabled: expertId > 0 }
  );

  const { data: accuracy } = trpc.experts.getExpertAccuracy.useQuery(
    { influencerId: expertId },
    { enabled: expertId > 0 }
  );

  const { data: contents } = trpc.contents.byInfluencer.useQuery(
    { influencerId: expertId, limit: 10 },
    { enabled: expertId > 0 }
  );

  if (influencerLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-cyan-400">로딩 중...</div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">전문가를 찾을 수 없습니다</h1>
          <Link href="/">
            <Button variant="outline">홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Grade badge styling
  const getGradeBadge = (grade?: string) => {
    if (!grade) return null;
    
    const styles = {
      S: "bg-gradient-to-r from-yellow-400 to-orange-400 text-black",
      A: "bg-gradient-to-r from-blue-400 to-cyan-400 text-black",
      B: "bg-gradient-to-r from-green-400 to-emerald-400 text-black",
      C: "bg-gradient-to-r from-gray-400 to-slate-400 text-black",
      D: "bg-gradient-to-r from-red-400 to-rose-400 text-white",
    };

    const stars = {
      S: "⭐⭐⭐⭐⭐",
      A: "⭐⭐⭐⭐",
      B: "⭐⭐⭐",
      C: "⭐⭐",
      D: "⭐",
    };

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg ${styles[grade as keyof typeof styles]}`}>
        <Award className="w-5 h-5" />
        {grade}등급 {stars[grade as keyof typeof stars]}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Expert Header */}
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-cyan-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{influencer.name}</h1>
              {influencer.specialty && (
                <p className="text-cyan-400 text-lg mb-1">{influencer.specialty}</p>
              )}
              {influencer.bio && (
                <p className="text-slate-400 line-clamp-2">{influencer.bio}</p>
              )}
            </div>
            {accuracy?.grade && getGradeBadge(accuracy.grade)}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-950/50 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">팔로워</div>
              <div className="text-2xl font-bold text-cyan-300">
                {influencer.followerCount ? influencer.followerCount.toLocaleString() : 'N/A'}
              </div>
            </div>

            {accuracy && (
              <>
                <div className="bg-slate-950/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">전체 정확도</div>
                  <div className="text-2xl font-bold text-green-400">{accuracy.accuracyRate}%</div>
                </div>

                <div className="bg-slate-950/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">총 예측</div>
                  <div className="text-2xl font-bold text-white">{accuracy.totalPredictions}</div>
                </div>

                <div className="bg-slate-950/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">가중치</div>
                  <div className="text-2xl font-bold text-yellow-400">{(accuracy.weight / 100).toFixed(1)}x</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Accuracy Breakdown */}
        {accuracy && (
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-cyan-500/30 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              정확도 분석
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall */}
              <div className="bg-slate-950/50 rounded-lg p-6">
                <div className="text-slate-400 text-sm mb-2">전체 기간</div>
                <div className="text-4xl font-bold text-white mb-2">{accuracy.accuracyRate}%</div>
                <div className="text-sm text-slate-400">
                  {accuracy.correctPredictions}승 {accuracy.totalPredictions - accuracy.correctPredictions}패
                </div>
                <div className="mt-4 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-400 h-full"
                    style={{ width: `${accuracy.accuracyRate}%` }}
                  />
                </div>
              </div>

              {/* Last 30 Days */}
              <div className="bg-slate-950/50 rounded-lg p-6">
                <div className="text-slate-400 text-sm mb-2">최근 30일</div>
                <div className="text-4xl font-bold text-white mb-2">
                  {accuracy.last30DaysAccuracy || 0}%
                </div>
                <div className="text-sm text-slate-400">단기 성과</div>
                <div className="mt-4 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full"
                    style={{ width: `${accuracy.last30DaysAccuracy || 0}%` }}
                  />
                </div>
              </div>

              {/* Last 90 Days */}
              <div className="bg-slate-950/50 rounded-lg p-6">
                <div className="text-slate-400 text-sm mb-2">최근 90일</div>
                <div className="text-4xl font-bold text-white mb-2">
                  {accuracy.last90DaysAccuracy || 0}%
                </div>
                <div className="text-sm text-slate-400">중기 성과</div>
                <div className="mt-4 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-pink-400 h-full"
                    style={{ width: `${accuracy.last90DaysAccuracy || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Grade Explanation */}
            <div className="mt-8 p-6 bg-slate-950/50 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-4">등급 시스템</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold py-2 px-4 rounded-lg mb-2">
                    S등급
                  </div>
                  <div className="text-sm text-slate-400">90%+ 정확도</div>
                  <div className="text-sm text-yellow-400 font-bold">2.0x 가중치</div>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-400 to-cyan-400 text-black font-bold py-2 px-4 rounded-lg mb-2">
                    A등급
                  </div>
                  <div className="text-sm text-slate-400">80-90% 정확도</div>
                  <div className="text-sm text-cyan-400 font-bold">1.5x 가중치</div>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-black font-bold py-2 px-4 rounded-lg mb-2">
                    B등급
                  </div>
                  <div className="text-sm text-slate-400">70-80% 정확도</div>
                  <div className="text-sm text-green-400 font-bold">1.2x 가중치</div>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-gray-400 to-slate-400 text-black font-bold py-2 px-4 rounded-lg mb-2">
                    C등급
                  </div>
                  <div className="text-sm text-slate-400">60-70% 정확도</div>
                  <div className="text-sm text-slate-400 font-bold">1.0x 가중치</div>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-red-400 to-rose-400 text-white font-bold py-2 px-4 rounded-lg mb-2">
                    D등급
                  </div>
                  <div className="text-sm text-slate-400">60% 미만</div>
                  <div className="text-sm text-red-400 font-bold">0.5x 가중치</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Content */}
        {contents && contents.length > 0 && (
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-cyan-500/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-cyan-400" />
              최근 콘텐츠
            </h2>

            <div className="space-y-4">
              {contents.map((content) => {
                let aiStocks = [];
                try {
                  if (content.aiStocks) {
                    aiStocks = typeof content.aiStocks === 'string' ? JSON.parse(content.aiStocks) : content.aiStocks;
                  }
                } catch (e) {}

                return (
                  <div key={content.id} className="bg-slate-950/50 rounded-lg p-6 hover:bg-slate-950/70 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white flex-1">{content.title}</h3>
                      {content.aiSentiment && (
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          content.aiSentiment === 'bullish' ? 'bg-green-500/20 text-green-400' :
                          content.aiSentiment === 'bearish' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {content.aiSentiment === 'bullish' && <TrendingUp className="w-4 h-4" />}
                          {content.aiSentiment === 'bearish' && <TrendingDown className="w-4 h-4" />}
                          {content.aiSentiment === 'bullish' ? '상승' : content.aiSentiment === 'bearish' ? '하락' : '중립'}
                        </div>
                      )}
                    </div>

                    {content.description && (
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{content.description}</p>
                    )}

                    {aiStocks.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {aiStocks.map((ticker: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium">
                            ${ticker}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{new Date(content.publishedAt).toLocaleDateString('ko-KR')}</span>
                      {content.url && (
                        <a 
                          href={content.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          원문 보기 →
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
