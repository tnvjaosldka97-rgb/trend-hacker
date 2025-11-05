import { invokeLLM } from './_core/llm';
import * as db from './db';

/**
 * AI 리포트 타입
 */
export type ReportType = 'pro' | 'premium';

/**
 * AI 리포트 생성 함수
 * 
 * Pro: 주간 1회, 간단한 요약 (1-2페이지)
 * Premium: 일간 1회, 상세 분석 (3-5페이지)
 */
export async function generateAIReport(userId: number, reportType: ReportType): Promise<string> {
  // 1. 사용자 구독 정보 확인
  const subscription = await db.getUserSubscription(userId);
  if (!subscription || subscription.status !== 'active') {
    throw new Error('활성화된 구독이 없습니다.');
  }

  if (reportType === 'pro' && subscription.plan !== 'pro' && subscription.plan !== 'premium') {
    throw new Error('Pro 플랜 이상이 필요합니다.');
  }

  if (reportType === 'premium' && subscription.plan !== 'premium') {
    throw new Error('Premium 플랜이 필요합니다.');
  }

  // 2. 최근 데이터 수집
  const timeRange = reportType === 'pro' ? '7d' : '24h';
  const { getTodayTrending, getWeeklyTrending } = await import('./trending');
  const trendingData = reportType === 'pro' 
    ? await getWeeklyTrending() 
    : await getTodayTrending();

  const topStocks = trendingData.stocks.slice(0, 10);

  // 3. AI 프롬프트 생성
  const prompt = reportType === 'pro' 
    ? generateProPrompt(topStocks)
    : generatePremiumPrompt(topStocks);

  // 4. AI 리포트 생성
  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: reportType === 'pro'
          ? 'You are a professional stock market analyst. Provide concise weekly summaries in Korean.'
          : 'You are a senior stock market analyst. Provide detailed daily analysis with deep insights in Korean.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const content = response.choices[0]?.message?.content;
  const report = typeof content === 'string' ? content : '';
  
  return report;
}

/**
 * Pro 플랜 프롬프트 (간단한 주간 요약)
 */
function generateProPrompt(stocks: Array<{ ticker: string; count: number; bullish: number; bearish: number; neutral: number }>): string {
  const stockList = stocks.map((s, i) => 
    `${i + 1}. ${s.ticker} - ${s.count}회 언급 (상승 ${s.bullish}, 하락 ${s.bearish}, 중립 ${s.neutral})`
  ).join('\n');

  return `
# 주간 주식 트렌드 리포트 (Pro)

다음은 지난 7일간 전문가들이 가장 많이 언급한 종목들입니다:

${stockList}

**요청사항:**
1. 상위 5개 종목에 대한 간단한 요약 (각 2-3문장)
2. 전반적인 시장 분위기 (1-2문장)
3. 다음 주 주목할 포인트 (3-5개 불릿 포인트)

**형식:**
- 총 1-2페이지 분량
- 간결하고 핵심만 전달
- 초보자도 이해하기 쉽게 작성
`;
}

/**
 * Premium 플랜 프롬프트 (상세한 일간 분석)
 */
function generatePremiumPrompt(stocks: Array<{ ticker: string; count: number; bullish: number; bearish: number; neutral: number }>): string {
  const stockList = stocks.map((s, i) => 
    `${i + 1}. ${s.ticker} - ${s.count}회 언급 (상승 ${s.bullish}, 하락 ${s.bearish}, 중립 ${s.neutral})`
  ).join('\n');

  return `
# 일간 주식 심층 분석 리포트 (Premium)

다음은 오늘 전문가들이 가장 많이 언급한 종목들입니다:

${stockList}

**요청사항:**
1. **종목별 상세 분석** (상위 10개 종목)
   - 현재 주가 동향 및 기술적 분석
   - 전문가 의견 컨센서스 해석
   - 상승/하락 근거 분석
   - 리스크 요인 및 기회 요인
   
2. **섹터별 분석**
   - 오늘 강세를 보인 섹터
   - 약세를 보인 섹터
   - 섹터 로테이션 가능성

3. **거시경제 영향**
   - 금리, 환율, 원자재 가격 등 거시 지표 영향
   - 주요 경제 이벤트 및 뉴스 분석

4. **투자 전략 제안**
   - 단기 트레이딩 전략 (1-3일)
   - 중기 투자 전략 (1-4주)
   - 포트폴리오 리밸런싱 제안

5. **리스크 관리**
   - 주의해야 할 종목 및 섹터
   - 손절/익절 가이드라인
   - 변동성 대응 전략

**형식:**
- 총 3-5페이지 분량
- 데이터 기반의 깊이 있는 분석
- 구체적인 수치와 근거 제시
- 차트 및 테이블 활용 (마크다운 형식)
- 전문 투자자를 위한 고급 인사이트
`;
}

/**
 * 리포트 저장 (향후 이메일 발송 또는 대시보드 표시용)
 */
export async function saveReport(userId: number, reportType: ReportType, content: string) {
  // TODO: reports 테이블에 저장
  // 현재는 콘솔에만 출력
  console.log(`[AI Report] Saved ${reportType} report for user ${userId}`);
  console.log(`[AI Report] Content length: ${content.length} characters`);
}
