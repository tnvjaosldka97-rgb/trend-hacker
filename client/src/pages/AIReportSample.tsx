import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function AIReportSample() {
  const [reportType, setReportType] = useState<"pro" | "premium">("pro");
  const [report, setReport] = useState<string>("");

  const generateReportMutation = trpc.subscription.generateReport.useMutation({
    onSuccess: (data) => {
      setReport(data.report);
      toast.success("AI 리포트가 생성되었습니다!");
    },
    onError: (error) => {
      toast.error(error.message || "리포트 생성에 실패했습니다.");
    },
  });

  const handleGenerate = () => {
    setReport("");
    generateReportMutation.mutate({ reportType });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-300 mb-1">AI 리포트 샘플</h1>
              <p className="text-slate-400 text-sm">Pro vs Premium 리포트 비교</p>
            </div>
            <a
              href="/"
              className="text-slate-400 hover:text-cyan-300 transition-colors"
            >
              ← 홈으로
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Report Type Selector */}
        <div className="mb-8 flex justify-center gap-4">
          <Button
            variant={reportType === "pro" ? "default" : "outline"}
            onClick={() => setReportType("pro")}
            className={reportType === "pro" ? "bg-cyan-500 hover:bg-cyan-600" : ""}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Pro 리포트 (주간)
          </Button>
          <Button
            variant={reportType === "premium" ? "default" : "outline"}
            onClick={() => setReportType("premium")}
            className={reportType === "premium" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
          >
            <FileText className="w-4 h-4 mr-2" />
            Premium 리포트 (일간)
          </Button>
        </div>

        {/* Description */}
        <div className="mb-8 max-w-3xl mx-auto">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {reportType === "pro" ? "Pro 플랜 리포트" : "Premium 플랜 리포트"}
            </h2>
            <div className="space-y-2 text-slate-300">
              {reportType === "pro" ? (
                <>
                  <p>• <strong>주간 1회</strong> 발송 (매주 월요일)</p>
                  <p>• <strong>1-2페이지</strong> 분량의 간단한 요약</p>
                  <p>• 상위 5개 종목 핵심 분석</p>
                  <p>• 전반적인 시장 분위기 요약</p>
                  <p>• 다음 주 주목할 포인트 (불릿 포인트)</p>
                </>
              ) : (
                <>
                  <p>• <strong>일간 1회</strong> 발송 (매일 오전 9시)</p>
                  <p>• <strong>3-5페이지</strong> 분량의 상세 분석</p>
                  <p>• 상위 10개 종목 심층 분석</p>
                  <p>• 섹터별 분석 및 거시경제 영향</p>
                  <p>• 투자 전략 제안 (단기/중기)</p>
                  <p>• 리스크 관리 가이드라인</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mb-8 text-center">
          <Button
            onClick={handleGenerate}
            disabled={generateReportMutation.isPending}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-8"
          >
            {generateReportMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                AI 리포트 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                샘플 리포트 생성
              </>
            )}
          </Button>
        </div>

        {/* Report Display */}
        {report && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white text-slate-900 rounded-lg shadow-2xl p-8 md:p-12">
              <div className="prose prose-slate max-w-none">
                <Streamdown>{report}</Streamdown>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!report && !generateReportMutation.isPending && (
          <div className="text-center text-slate-500 py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>위 버튼을 클릭하여 AI 리포트 샘플을 생성해보세요.</p>
          </div>
        )}
      </main>
    </div>
  );
}
