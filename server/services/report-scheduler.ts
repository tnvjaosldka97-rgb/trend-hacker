import cron from 'node-cron';
import { generateAIReport } from '../ai-report';
import { getDb } from '../db';
import { subscriptions } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * AI 리포트 자동 생성 스케줄러
 * 
 * Pro 플랜: 매주 월요일 오전 9시 (KST)
 * Premium 플랜: 매일 오전 9시 (KST)
 */

export function startReportScheduler() {
  console.log('[Report Scheduler] Starting AI report generation scheduler...');

  // Premium 플랜: 매일 오전 9시 (KST = UTC+9)
  // Cron: 0 0 * * * (UTC 00:00 = KST 09:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('[Report Scheduler] Daily Premium report generation started');
    await generateReportsForPlan('premium');
  }, {
    timezone: 'Asia/Seoul'
  });

  // Pro 플랜: 매주 월요일 오전 9시 (KST)
  // Cron: 0 0 * * 1 (매주 월요일 UTC 00:00 = KST 09:00)
  cron.schedule('0 0 * * 1', async () => {
    console.log('[Report Scheduler] Weekly Pro report generation started');
    await generateReportsForPlan('pro');
  }, {
    timezone: 'Asia/Seoul'
  });

  console.log('[Report Scheduler] Scheduler started successfully');
  console.log('[Report Scheduler] Premium reports: Daily at 09:00 KST');
  console.log('[Report Scheduler] Pro reports: Every Monday at 09:00 KST');
}

async function generateReportsForPlan(planType: 'pro' | 'premium') {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[Report Scheduler] Database not available');
      return;
    }

    // Get all active subscribers for this plan
    const activeSubscribers = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.plan, planType))
      .where(eq(subscriptions.status, 'active'));

    console.log(`[Report Scheduler] Found ${activeSubscribers.length} active ${planType} subscribers`);

    let successCount = 0;
    let failCount = 0;

    // Generate report for each subscriber
    for (const subscriber of activeSubscribers) {
      try {
        console.log(`[Report Scheduler] Generating ${planType} report for user ${subscriber.userId}...`);
        
        const reportId = await generateAIReport({
          userId: subscriber.userId,
          planType,
          reportDate: new Date(),
        });

        console.log(`[Report Scheduler] Report ${reportId} generated successfully for user ${subscriber.userId}`);
        successCount++;
      } catch (error) {
        console.error(`[Report Scheduler] Failed to generate report for user ${subscriber.userId}:`, error);
        failCount++;
      }

      // Wait 5 seconds between each generation to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log(`[Report Scheduler] ${planType} report generation completed: ${successCount} success, ${failCount} failed`);
  } catch (error) {
    console.error(`[Report Scheduler] Error generating ${planType} reports:`, error);
  }
}
