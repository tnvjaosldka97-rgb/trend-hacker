import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Download, Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

// 샘플 리포트 데이터
const proSampleReport = `# 📊 주간 AI 투자 리포트 (Pro)

**발행일**: 2025년 1월 6일 (월)  
**분석 기간**: 2024년 12월 30일 ~ 2025년 1월 3일

---

## 🔥 이번 주 HOT 종목 TOP 5

### 1. **TSLA (Tesla)** - 🚀 상승세
- **언급 횟수**: 61회
- **전문가 의견**: 80% 긍정적
- **핵심 포인트**: 4분기 실적 발표 앞두고 기대감 상승. 전기차 판매량 증가세 지속.

### 2. **QQQ (Invesco QQQ Trust)** - 📈 안정적
- **언급 횟수**: 8회  
- **전문가 의견**: 75% 긍정적
- **핵심 포인트**: 나스닥 100 추종 ETF. 기술주 강세 지속.

### 3. **SPY (SPDR S&P 500 ETF)** - 📊 중립
- **언급 횟수**: 8회
- **전문가 의견**: 60% 긍정적
- **핵심 포인트**: S&P 500 추종 ETF. 시장 전반적으로 안정적.

### 4. **NVDA (NVIDIA)** - 🔥 강세
- **언급 횟수**: 7회
- **전문가 의견**: 85% 긍정적
- **핵심 포인트**: AI 반도체 수요 증가. CES 2025 발표 기대.

### 5. **AAPL (Apple)** - 📱 주목
- **언급 횟수**: 6회
- **전문가 의견**: 70% 긍정적
- **핵심 포인트**: 아이폰 15 판매 호조. 서비스 부문 성장.

---

## 💡 다음 주 주목 포인트

- 📅 **1월 8일**: 테슬라 4분기 실적 발표
- 🏦 **1월 10일**: 미국 소비자물가지수(CPI) 발표
- 💻 **CES 2025**: 엔비디아, AMD 신제품 발표 예정

---

**면책 조항**: 본 리포트는 투자 권유가 아닌 정보 제공 목적입니다.`;

const premiumSampleReport = `# 📊 일간 AI 투자 심층 리포트 (Premium)

**발행일**: 2025년 1월 6일 (월) 오전 9시  
**분석 기간**: 2025년 1월 5일 (일) 00:00 ~ 23:59

---

## 🔥 오늘의 HOT 종목 TOP 10

### 1. **TSLA (Tesla, Inc.)** - 🚀 강력 매수 신호
- **언급 횟수**: 61회 | **전문가 의견**: 80% 긍정적 (49명 상승, 12명 중립)
- **현재가**: $248.50 | **전일 대비**: +3.2%
- **핵심 분석**:
  - 4분기 실적 발표 앞두고 기관 매수세 유입
  - 전기차 판매량 전년 대비 25% 증가 전망
  - 중국 시장 점유율 회복세
- **리스크**: 경쟁사 BYD의 공격적 가격 정책
- **투자 전략**: 단기 (1주) 목표가 $260, 중기 (1개월) $280

### 2. **NVDA (NVIDIA Corporation)** - 🔥 AI 반도체 강자
- **언급 횟수**: 7회 | **전문가 의견**: 85% 긍정적
- **현재가**: $495.20 | **전일 대비**: +1.8%
- **핵심 분석**:
  - CES 2025에서 차세대 GPU 발표 예정
  - 데이터센터 부문 매출 40% 증가 예상
  - AI 칩 수요 폭발적 증가
- **리스크**: AMD의 시장 점유율 확대
- **투자 전략**: 장기 보유 추천, 목표가 $550

### 3. **AAPL (Apple Inc.)** - 📱 서비스 부문 성장
- **언급 횟수**: 6회 | **전문가 의견**: 70% 긍정적
- **현재가**: $185.30 | **전일 대비**: +0.5%
- **핵심 분석**:
  - 아이폰 15 판매 호조 지속
  - 서비스 부문 매출 15% 증가
  - Vision Pro 출시 앞두고 기대감
- **리스크**: 중국 시장 규제 강화
- **투자 전략**: 중기 목표가 $195

### 4. **QQQ (Invesco QQQ Trust)** - 📈 기술주 ETF
- **언급 횟수**: 8회 | **전문가 의견**: 75% 긍정적
- **핵심 분석**: 나스닥 100 추종, 기술주 강세 지속

### 5. **SPY (SPDR S&P 500 ETF)** - 📊 시장 대표 ETF
- **언급 횟수**: 8회 | **전문가 의견**: 60% 긍정적
- **핵심 분석**: S&P 500 추종, 안정적 수익 추구

### 6-10. **기타 주목 종목**
- **MSFT**: 클라우드 부문 성장 (+2.1%)
- **GOOGL**: AI 검색 강화 (+1.5%)
- **AMZN**: 연말 쇼핑 시즌 호조 (+1.8%)
- **META**: 광고 매출 증가 (+2.3%)
- **AMD**: 서버 CPU 점유율 확대 (+3.0%)

---

## 📊 섹터별 분석

### 🖥️ 기술 섹터 (Technology)
- **전망**: 강세 지속
- **주요 이슈**: AI, 클라우드, 반도체 수요 증가
- **추천 종목**: NVDA, MSFT, AAPL

### 🚗 자동차 섹터 (Automotive)
- **전망**: 전기차 중심 성장
- **주요 이슈**: 테슬라 실적, 중국 시장 경쟁
- **추천 종목**: TSLA

### 💰 금융 섹터 (Financial)
- **전망**: 금리 인하 기대감
- **주요 이슈**: 연준 정책 변화
- **추천 종목**: JPM, BAC

---

## 🌍 거시경제 영향

### 📈 긍정 요인
1. **연준 금리 인하 기대**: 2025년 상반기 0.25% 인하 전망
2. **기업 실적 호조**: S&P 500 기업 4분기 실적 10% 증가 예상
3. **AI 투자 확대**: 빅테크 기업들의 AI 인프라 투자 증가

### 📉 리스크 요인
1. **지정학적 리스크**: 중동 긴장, 중국-미국 무역 갈등
2. **인플레이션 재부상**: 유가 상승 압력
3. **기술주 밸류에이션**: 일부 종목 고평가 우려

---

## 💼 투자 전략 제안

### 단기 (1주일)
- **공격적**: TSLA, NVDA 집중 투자
- **보수적**: QQQ, SPY 분산 투자

### 중기 (1개월)
- **성장주**: NVDA, MSFT, AAPL
- **배당주**: JNJ, PG, KO

### 장기 (6개월~1년)
- **핵심 포트폴리오**: 60% QQQ, 30% SPY, 10% 개별 종목
- **리밸런싱**: 분기별 1회

---

## ⚠️ 리스크 관리 가이드라인

1. **손절매 설정**: 개별 종목 -7% 도달 시 자동 매도
2. **포트폴리오 분산**: 단일 종목 비중 15% 이하 유지
3. **현금 비중**: 전체 자산의 10-20% 현금 보유
4. **정기 점검**: 주 1회 포트폴리오 리뷰

---

**면책 조항**: 본 리포트는 투자 권유가 아닌 정보 제공 목적입니다. 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.`;

export default function AIReportSample() {
  const [reportType, setReportType] = useState<"pro" | "premium">("pro");
  
  const currentReport = reportType === "pro" ? proSampleReport : premiumSampleReport;
  
  const downloadPdfMutation = trpc.pdf.downloadReport.useMutation({
    onSuccess: (data) => {
      // Base64 PDF를 Blob으로 변환
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // 다운로드 트리거
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF 다운로드 완료!');
    },
    onError: (error) => {
      toast.error(error.message || 'PDF 다운로드에 실패했습니다.');
    },
  });
  
  const handleDownloadPDF = () => {
    const filename = reportType === "pro" 
      ? "TREND_HACKER_주간리포트_Pro.pdf" 
      : "TREND_HACKER_일간리포트_Premium.pdf";
    
    downloadPdfMutation.mutate({
      content: currentReport,
      filename,
    });
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

        {/* PDF Download Button */}
        <div className="mb-8 text-center">
          <Button
            onClick={handleDownloadPDF}
            disabled={downloadPdfMutation.isPending}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-8"
          >
            {downloadPdfMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                PDF 생성 중...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                PDF 다운로드
              </>
            )}
          </Button>
        </div>

        {/* Report Display */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white text-slate-900 rounded-lg shadow-2xl p-8 md:p-12">
            <div className="prose prose-slate max-w-none">
              <Streamdown>{currentReport}</Streamdown>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
