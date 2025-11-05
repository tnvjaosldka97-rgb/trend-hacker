import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

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
