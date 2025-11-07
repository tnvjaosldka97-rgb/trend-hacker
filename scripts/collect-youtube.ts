import { callDataApi } from '../server/_core/dataApi';
import { getDb } from '../server/db';
import { stockTweets } from '../drizzle/schema';

// 주식 전문가 YouTube 채널 리스트
const YOUTUBE_CHANNELS = [
  // 글로벌 전문가
  { id: 'UCnMn36GT_H0X-w5_ckLtlgQ', name: 'Meet Kevin', username: 'MeetKevin' },
  { id: 'UCJ-cem2-ixthxWDRnVRJfvA', name: 'Graham Stephan', username: 'GrahamStephan' },
  { id: 'UCW0RXWkfbELvGYxfZI8-C9A', name: 'Andrei Jikh', username: 'AndreiJikh' },
  { id: 'UCFCEuCsyWP0YkP3CZ3Mr01Q', name: 'Financial Education', username: 'FinancialEducation' },
  { id: 'UCqK_GSMbpiV8spgD3ZGloSw', name: 'Ticker Symbol: YOU', username: 'TickerSymbolYOU' },
  
  // 한국 유튜버 (상위 10명)
  { id: 'UCkC7i7XG-cJjKzJ_F_6VPfQ', name: '소수몽키', username: '소수몽키' },
  { id: 'UCaVJIfXBGJYhRxqXNfRdLnQ', name: '미국주식으로 부자되기', username: '미주부' },
  { id: 'UC8JVcLVH8p7jLqVYPHcCQQQ', name: '내일은 투자왕', username: '김단테' },
  { id: 'UCz-8JhJFyP-6LhQqLmJCEKQ', name: '올랜도 킴', username: '올랜도킴' },
  { id: 'UCJ0EUxfJhN9bQqYhPGvCH5Q', name: '피터리', username: 'PIETERLEE' },
];

// 종목 티커 매핑
const STOCK_MAP: Record<string, string> = {
  'AAPL': 'AAPL', 'Apple': 'AAPL', '애플': 'AAPL',
  'MSFT': 'MSFT', 'Microsoft': 'MSFT', '마이크로소프트': 'MSFT',
  'AMZN': 'AMZN', 'Amazon': 'AMZN', '아마존': 'AMZN',
  'GOOGL': 'GOOGL', 'Google': 'GOOGL', 'Alphabet': 'GOOGL', '구글': 'GOOGL',
  'META': 'META', 'Meta': 'META', 'Facebook': 'META', '메타': 'META', '페이스북': 'META',
  'TSLA': 'TSLA', 'Tesla': 'TSLA', '테슬라': 'TSLA',
  'NVDA': 'NVDA', 'Nvidia': 'NVDA', 'NVIDIA': 'NVDA', '엔비디아': 'NVDA',
  'AMD': 'AMD', 'AMD': 'AMD',
  'INTC': 'INTC', 'Intel': 'INTC', '인텔': 'INTC',
  'SPY': 'SPY', 'S&P 500': 'SPY', 'S&P500': 'SPY',
  'QQQ': 'QQQ', 'Nasdaq': 'QQQ', '나스닥': 'QQQ',
};

/**
 * 티커 추출 (영어 + 한글 지원)
 */
function extractTickers(text: string): string[] {
  const tickers = new Set<string>();
  
  // $TICKER 패턴
  const tickerRegex = /\$([A-Z]{1,5})\b/g;
  const matches = text.match(tickerRegex);
  if (matches) {
    matches.forEach(m => tickers.add(m.slice(1)));
  }
  
  // 회사 이름 매칭 (영어 + 한글)
  for (const [name, ticker] of Object.entries(STOCK_MAP)) {
    if (new RegExp(`\\b${name}\\b`, 'i').test(text)) {
      tickers.add(ticker);
    }
  }
  
  return Array.from(tickers);
}

/**
 * YouTube 날짜 파싱 ("2 days ago", "3 weeks ago" 등)
 */
function parseYouTubeDate(dateText: string): Date {
  const now = new Date();
  
  // "X hours ago", "X days ago", "X weeks ago", "X months ago" 형식 파싱
  const match = dateText.match(/(\d+)\s+(hour|day|week|month|year)s?\s+ago/i);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'hour':
        return new Date(now.getTime() - value * 60 * 60 * 1000);
      case 'day':
        return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - value * 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - value * 30 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - value * 365 * 24 * 60 * 60 * 1000);
    }
  }
  
  // 파싱 실패 시 현재 시간 반환
  return now;
}

/**
 * 감성 분석 (영어 + 한글 키워드)
 */
function analyzeSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
  const bullishWords = [
    'bullish', 'buy', 'long', 'moon', 'pump', 'rally', 'surge', 'up', 'gain', 'rise',
    '상승', '매수', '급등', '강세', '호재', '긍정', '좋', '추천'
  ];
  const bearishWords = [
    'bearish', 'sell', 'short', 'crash', 'dump', 'fall', 'down', 'drop', 'decline',
    '하락', '매도', '급락', '약세', '악재', '부정', '나쁨', '위험'
  ];
  
  const lowerText = text.toLowerCase();
  const bullishCount = bullishWords.filter(w => lowerText.includes(w)).length;
  const bearishCount = bearishWords.filter(w => lowerText.includes(w)).length;
  
  if (bullishCount > bearishCount) return 'bullish';
  if (bearishCount > bullishCount) return 'bearish';
  return 'neutral';
}

/**
 * YouTube 채널에서 데이터 수집
 */
async function collectFromYouTubeChannel(channel: typeof YOUTUBE_CHANNELS[0], retries = 3): Promise<number> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📺 ${channel.name}${attempt > 1 ? ` (retry ${attempt}/${retries})` : ''}`);
      
      // YouTube 채널 최신 영상 가져오기
      const result = await callDataApi('Youtube/get_channel_videos', {
        query: { 
          id: channel.id,
          filter: 'videos_latest',
          hl: 'ko'
        },
      });
      
      const contents = result?.contents || [];
      console.log(`  📊 ${contents.length} videos`);
      
      if (contents.length === 0) {
        return 0;
      }
      
      // 데이터베이스 저장
      const db = await getDb();
      if (!db) {
        console.log('  ❌ DB not available');
        return 0;
      }
      
      let saved = 0;
      for (const item of contents.slice(0, 10)) { // 최신 10개만
        if (item.type !== 'video') continue;
        
        const video = item.video;
        if (!video) continue;
        
        const title = video.title || '';
        const description = video.descriptionSnippet || '';
        const fullText = `${title} ${description}`;
        
        const tickers = extractTickers(fullText);
        if (tickers.length === 0) continue;
        
        // 각 티커마다 별도 레코드 저장
        for (const ticker of tickers) {
          try {
            await db.insert(stockTweets).values({
              tweetId: `yt-${video.videoId}-${ticker}`,
              authorUsername: channel.username,
              authorName: channel.name,
              text: `${title}\n${description}`,
              ticker,
              sentiment: analyzeSentiment(fullText),
              url: `https://youtube.com/watch?v=${video.videoId}`,
              likeCount: 0,
              retweetCount: 0,
              createdAt: video.publishedTimeText ? parseYouTubeDate(video.publishedTimeText) : new Date(),
            });
            saved++;
          } catch (error: any) {
            if (error.code !== 'ER_DUP_ENTRY') {
              console.error(`  ❌ Save error:`, error.message);
            }
          }
        }
      }
      
      console.log(`  ✅ ${saved} saved`);
      return saved;
      
    } catch (error: any) {
      // Rate limit 에러 시 재시도
      if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        if (attempt < retries) {
          const waitTime = Math.pow(2, attempt) * 15000; // 15s, 30s, 60s
          console.log(`  ⏳ Rate limit hit. Waiting ${waitTime/1000}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      console.error(`  ❌ Error processing ${channel.name}:`, error.message);
      return 0;
    }
  }
  
  return 0;
}

/**
 * 메인 함수
 */
async function main() {
  console.log('🚀 Starting YouTube data collection');
  console.log(`📊 Processing ${YOUTUBE_CHANNELS.length} channels`);
  console.log(`⏱️  API call interval: 180s`);
  
  let total = 0;
  
  for (let i = 0; i < YOUTUBE_CHANNELS.length; i++) {
    console.log(`\n[${i + 1}/${YOUTUBE_CHANNELS.length}]`);
    const saved = await collectFromYouTubeChannel(YOUTUBE_CHANNELS[i], 3);
    total += saved;
    
    // Rate limit 방지
    if (i < YOUTUBE_CHANNELS.length - 1) {
      console.log(`  ⏳ Waiting 180s before next channel...`);
      await new Promise(resolve => setTimeout(resolve, 180000));
    }
  }
  
  console.log(`\n\n✅ Complete! Saved ${total} items from YouTube`);
}

main().catch(console.error);
