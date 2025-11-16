import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { generateAIReport } from './ai-report';
import { getDb } from './db';
import { subscriptions } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

const execAsync = promisify(exec);

/**
 * 주 1회 ETF 보유종목 데이터 수집 (매주 월요일 새벽 2시)
 */
export function startWeeklyETFCollectionScheduler() {
  console.log('[Scheduler] Starting weekly ETF holdings collection scheduler (Monday 2 AM KST)...');
  
  // 매주 월요일 새벽 2시 실행 (한국 시간 기준, UTC+9)
  // UTC 시간으로는 일요일 17시
  cron.schedule('0 17 * * 0', async () => {
    const now = new Date().toISOString();
    console.log(`[Scheduler] ${now} - Starting WEEKLY ETF collection...`);
    
    try {
      const etfScriptPath = path.join(process.cwd(), 'scripts/collect-etf-holdings-llm.ts');
      
      const { stdout, stderr } = await execAsync(
        `npx tsx ${etfScriptPath}`,
        {
          cwd: process.cwd(),
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          timeout: 30 * 60 * 1000, // 30분 타임아웃
        }
      );
      
      if (stdout) {
        console.log('[Scheduler] ETF collection output:', stdout.slice(-500));
      }
      
      if (stderr) {
        console.error('[Scheduler] ETF collection errors:', stderr);
      }
      
      console.log(`[Scheduler] ${new Date().toISOString()} - WEEKLY ETF collection completed`);
    } catch (error) {
      console.error('[Scheduler] ETF collection failed:', error);
    }
  });
}

/**
 * 매일 새벽 3시에 데이터 수집 (Twitter + YouTube, 180초 간격)
 */
export function startDailyCollectionScheduler() {
  console.log('[Scheduler] Starting daily data collection scheduler (3 AM KST)...');
  
  // 매일 새벽 3시 실행 (한국 시간 기준, UTC+9)
  // UTC 시간으로는 18시 (전날 저녁 6시)
  cron.schedule('0 18 * * *', async () => {
    const now = new Date().toISOString();
    console.log(`[Scheduler] ${now} - Starting DAILY collection...`);
    
    try {
      // 1. Twitter 크롤링 (20명, 180초 간격)
      console.log('[Scheduler] Step 1/2: Twitter collection...');
      const twitterScriptPath = path.join(process.cwd(), 'scripts/collect-twitter-simple.ts');
      
      const { stdout: twitterStdout, stderr: twitterStderr } = await execAsync(
        `npx tsx ${twitterScriptPath} daily`,
        {
          cwd: process.cwd(),
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          timeout: 90 * 60 * 1000, // 90분 타임아웃 (20명 × 180초 = 60분 + 여유)
        }
      );
      
      if (twitterStdout) {
        console.log('[Scheduler] Twitter output:', twitterStdout.slice(-500));
      }
      
      if (twitterStderr) {
        console.error('[Scheduler] Twitter errors:', twitterStderr);
      }
      
      // 2. YouTube 크롤링 (10개 채널, 180초 간격)
      console.log('[Scheduler] Step 2/2: YouTube collection...');
      const youtubeScriptPath = path.join(process.cwd(), 'scripts/collect-youtube.ts');
      
      const { stdout: youtubeStdout, stderr: youtubeStderr } = await execAsync(
        `npx tsx ${youtubeScriptPath}`,
        {
          cwd: process.cwd(),
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          timeout: 45 * 60 * 1000, // 45분 타임아웃 (10개 × 180초 = 30분 + 여유)
        }
      );
      
      if (youtubeStdout) {
        console.log('[Scheduler] YouTube output:', youtubeStdout.slice(-500));
      }
      
      if (youtubeStderr) {
        console.error('[Scheduler] YouTube errors:', youtubeStderr);
      }
      
      console.log(`[Scheduler] ${new Date().toISOString()} - Daily collection completed`);
      
      // Save collection timestamp to DB
      const { setSystemMetadata } = await import('./db');
      await setSystemMetadata('lastDailyCollection', new Date().toISOString());
      console.log('[Scheduler] Daily timestamp saved to database');
    } catch (error) {
      console.error('[Scheduler] Daily collection failed:', error);
    }
  });
  
  console.log('[Scheduler] Daily scheduler started.');
  console.log('[Scheduler] Runs at 3:00 AM KST (18:00 UTC) every day');
  console.log('[Scheduler] Twitter: 20 influencers, 180s interval');
  console.log('[Scheduler] YouTube: 10 channels, 180s interval');
}

/**
 * AI 리포트 자동 생성 스케줄러
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
      .where(and(eq(subscriptions.plan, planType), eq(subscriptions.status, 'active')));

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
