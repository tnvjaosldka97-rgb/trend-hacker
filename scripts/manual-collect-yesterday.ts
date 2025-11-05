#!/usr/bin/env npx tsx

/**
 * 어제 데이터 수동 크롤링 스크립트
 * 
 * 사용법: npx tsx scripts/manual-collect-yesterday.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

async function main() {
  console.log('='.repeat(60));
  console.log('어제 데이터 수동 크롤링 시작');
  console.log('='.repeat(60));
  console.log('');
  
  const startTime = Date.now();
  
  try {
    // 1. Twitter 크롤링 (20명, 180초 간격)
    console.log('[1/2] Twitter 데이터 수집 중...');
    console.log('- 대상: TOP 20 전문가');
    console.log('- 간격: 180초 (3분)');
    console.log('- 예상 소요 시간: 약 60분');
    console.log('');
    
    const twitterScriptPath = path.join(process.cwd(), 'scripts/collect-twitter-simple.ts');
    
    const { stdout: twitterStdout, stderr: twitterStderr } = await execAsync(
      `npx tsx ${twitterScriptPath} daily`,
      {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 90 * 60 * 1000, // 90분 타임아웃
      }
    );
    
    if (twitterStdout) {
      console.log('Twitter 수집 완료:');
      console.log(twitterStdout.slice(-1000)); // 마지막 1000자만 출력
    }
    
    if (twitterStderr) {
      console.error('Twitter 에러:', twitterStderr);
    }
    
    console.log('');
    console.log('✅ Twitter 데이터 수집 완료');
    console.log('');
    
    // 2. YouTube 크롤링 (10개 채널, 180초 간격)
    console.log('[2/2] YouTube 데이터 수집 중...');
    console.log('- 대상: 10개 채널');
    console.log('- 간격: 180초 (3분)');
    console.log('- 예상 소요 시간: 약 30분');
    console.log('');
    
    const youtubeScriptPath = path.join(process.cwd(), 'scripts/collect-youtube.ts');
    
    const { stdout: youtubeStdout, stderr: youtubeStderr } = await execAsync(
      `npx tsx ${youtubeScriptPath}`,
      {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 60 * 60 * 1000, // 60분 타임아웃
      }
    );
    
    if (youtubeStdout) {
      console.log('YouTube 수집 완료:');
      console.log(youtubeStdout.slice(-1000)); // 마지막 1000자만 출력
    }
    
    if (youtubeStderr) {
      console.error('YouTube 에러:', youtubeStderr);
    }
    
    console.log('');
    console.log('✅ YouTube 데이터 수집 완료');
    console.log('');
    
    const elapsedMinutes = Math.round((Date.now() - startTime) / 1000 / 60);
    
    console.log('='.repeat(60));
    console.log(`✅ 전체 데이터 수집 완료! (소요 시간: ${elapsedMinutes}분)`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('');
    console.error('❌ 데이터 수집 중 오류 발생:');
    console.error(error);
    process.exit(1);
  }
}

main();
