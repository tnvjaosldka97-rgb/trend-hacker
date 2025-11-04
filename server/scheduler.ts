import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// 3분마다 실시간 데이터 수집
// Cron expression: every 3 minutes
export function startDataCollectionScheduler() {
  console.log('[Scheduler] Starting 3-minute data collection scheduler...');
  
  // 3분마다 실행
  cron.schedule('*/3 * * * *', async () => {
    const now = new Date().toISOString();
    console.log(`[Scheduler] ${now} - Starting data collection...`);
    
    try {
      const scriptPath = path.join(process.cwd(), 'scripts/collect-twitter-data-v2.ts');
      const dataPath = path.join(process.cwd(), 'data/top-50-realtime.json');
      
      const { stdout, stderr } = await execAsync(
        `npx tsx ${scriptPath} ${dataPath}`,
        {
          cwd: process.cwd(),
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        }
      );
      
      if (stdout) {
        console.log('[Scheduler] Collection output:', stdout.slice(-500)); // Last 500 chars
      }
      
      if (stderr) {
        console.error('[Scheduler] Collection errors:', stderr);
      }
      
      console.log(`[Scheduler] ${new Date().toISOString()} - Data collection completed`);
      
      // Save collection timestamp to DB
      const { setSystemMetadata } = await import('./db');
      await setSystemMetadata('lastDataCollection', new Date().toISOString());
      console.log('[Scheduler] Timestamp saved to database');
    } catch (error) {
      console.error('[Scheduler] Data collection failed:', error);
    }
  });
  
  console.log('[Scheduler] Scheduler started successfully. Running every 3 minutes.');
  console.log('[Scheduler] Next run will be at:', getNextRunTime());
}

/**
 * 다음 실행 시간 계산
 */
function getNextRunTime(): string {
  const now = new Date();
  const minutes = now.getMinutes();
  const nextMinutes = Math.ceil((minutes + 1) / 3) * 3;
  const nextRun = new Date(now);
  
  if (nextMinutes >= 60) {
    nextRun.setHours(nextRun.getHours() + 1);
    nextRun.setMinutes(nextMinutes - 60);
  } else {
    nextRun.setMinutes(nextMinutes);
  }
  
  nextRun.setSeconds(0);
  nextRun.setMilliseconds(0);
  
  return nextRun.toISOString();
}
