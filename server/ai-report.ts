import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { aiReports } from "../drizzle/schema";
import { getWeeklyTrending } from "./trending";

export type ReportPlanType = "pro" | "premium";

interface GenerateReportOptions {
  userId: number;
  planType: ReportPlanType;
  reportDate: Date;
}

/**
 * Generate AI report based on plan type
 */
export async function generateAIReport(options: GenerateReportOptions): Promise<number> {
  const { userId, planType, reportDate } = options;

  // Fetch trending data
  const trendingData = await getWeeklyTrending();
  
  if (!trendingData || trendingData.length === 0) {
    throw new Error("No trending data available for report generation");
  }

  // Generate report content based on plan type
  const content = await (planType === "pro" 
    ? generateProReport(trendingData)
    : generatePremiumReport(trendingData));

  const title = planType === "pro"
    ? `주간 AI 리포트 - ${formatDate(reportDate)}`
    : `일간 심층 AI 리포트 - ${formatDate(reportDate)}`;

  // Save to database
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(aiReports).values({
    userId,
    planType,
    title,
    content,
    reportDate,
  });

  console.log(`[AI Report] Generated ${planType} report for user ${userId}`);
  
  return result[0].insertId;
}

/**
 * Generate Pro plan report (weekly, simple summary)
 */
async function generateProReport(trendingData: any[]): Promise<string> {
  const top5 = trendingData.slice(0, 5);
  
  const prompt = `당신은 주식 시장 분석 전문가입니다. 다음 주간 트렌딩 종목 데이터를 바탕으로 **간단한 주간 요약 리포트**를 작성해주세요.

**트렌딩 종목 TOP 5:**
${top5.map((stock, i) => `${i + 1}. ${stock.ticker} - ${stock.mentions}회 언급`).join('\n')}

**리포트 형식:**
1. **이번 주 핵심 요약** (2-3문장)
2. **주목할 종목 TOP 5** (각 종목당 1-2문장)
3. **다음 주 전망** (2-3문장)

간결하고 핵심적인 내용만 포함하세요. 1-2페이지 분량으로 작성하세요.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "당신은 주식 시장 분석 전문가입니다." },
      { role: "user", content: prompt },
    ],
  });

  return response.choices[0].message.content || "";
}

/**
 * Generate Premium plan report (daily, detailed analysis)
 */
async function generatePremiumReport(trendingData: any[]): Promise<string> {
  const top10 = trendingData.slice(0, 10);
  
  const prompt = `당신은 주식 시장 분석 전문가입니다. 다음 일간 트렌딩 종목 데이터를 바탕으로 **상세한 심층 분석 리포트**를 작성해주세요.

**트렌딩 종목 TOP 10:**
${top10.map((stock, i) => `${i + 1}. ${stock.ticker} - ${stock.mentions}회 언급`).join('\n')}

**리포트 형식:**
1. **시장 개요** (현재 시장 상황 및 분위기)
2. **주목할 종목 TOP 10 심층 분석**
   - 각 종목의 현재 상황
   - 전문가 의견 요약
   - 투자 포인트
3. **섹터별 분석** (기술주, 금융주, 에너지 등)
4. **투자 전략 제안**
   - 단기 전략 (1주일)
   - 중기 전략 (1개월)
5. **리스크 관리 가이드라인**

상세하고 전문적인 내용으로 3-5페이지 분량으로 작성하세요.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "당신은 주식 시장 심층 분석 전문가입니다." },
      { role: "user", content: prompt },
    ],
  });

  return response.choices[0].message.content || "";
}

/**
 * Get user's AI reports
 */
export async function getUserReports(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const { desc, eq } = await import("drizzle-orm");
  
  return await db
    .select()
    .from(aiReports)
    .where(eq(aiReports.userId, userId))
    .orderBy(desc(aiReports.reportDate))
    .limit(limit);
}

/**
 * Get report by ID (with user permission check)
 */
export async function getReportById(reportId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const { eq, and } = await import("drizzle-orm");
  
  const results = await db
    .select()
    .from(aiReports)
    .where(and(
      eq(aiReports.id, reportId),
      eq(aiReports.userId, userId)
    ))
    .limit(1);

  return results.length > 0 ? results[0] : null;
}

/**
 * Format date for report title
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}
