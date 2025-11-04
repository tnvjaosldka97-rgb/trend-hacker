import { callDataApi } from '../server/_core/dataApi';
import { getDb } from '../server/db';
import { stockTweets } from '../drizzle/schema';

// 주요 인플루언서 20명만 선택 (rate limit 방지)
const TOP_INFLUENCERS = [
  'elonmusk', 'CathieDWood', 'chamath', 'jimcramer', 'GaryBlack00',
  'SawyerMerritt', 'WholeMarsBlog', 'TroyTeslike', 'Gurgavin', 'alex_avoigt',
  'AswathDamodaran', 'profgalloway', 'TaviCosta', 'LukeGromen', 'JeffSnider_AIP',
  'KimbleCharting', 'allstarcharts', 'CarterBraxton', 'DanGramza', 'MarkMinervini'
];

// 종목 티커 매핑
const STOCK_MAP: Record<string, string> = {
  'AAPL': 'AAPL', 'Apple': 'AAPL',
  'MSFT': 'MSFT', 'Microsoft': 'MSFT',
  'AMZN': 'AMZN', 'Amazon': 'AMZN',
  'GOOGL': 'GOOGL', 'Google': 'GOOGL', 'Alphabet': 'GOOGL',
  'META': 'META', 'Meta': 'META', 'Facebook': 'META',
  'TSLA': 'TSLA', 'Tesla': 'TSLA',
  'NVDA': 'NVDA', 'Nvidia': 'NVDA', 'NVIDIA': 'NVDA',
  'AMD': 'AMD',
  'INTC': 'INTC', 'Intel': 'INTC',
  'SPY': 'SPY', 'S&P 500': 'SPY',
  'QQQ': 'QQQ', 'Nasdaq': 'QQQ',
};

/**
 * 티커 추출
 */
function extractTickers(text: string): string[] {
  const tickers = new Set<string>();
  
  // $TICKER 패턴
  const tickerRegex = /\$([A-Z]{1,5})\b/g;
  const matches = text.match(tickerRegex);
  if (matches) {
    matches.forEach(m => tickers.add(m.slice(1)));
  }
  
  // 회사 이름 매칭
  for (const [name, ticker] of Object.entries(STOCK_MAP)) {
    if (new RegExp(`\\b${name}\\b`, 'i').test(text)) {
      tickers.add(ticker);
    }
  }
  
  return Array.from(tickers);
}

/**
 * 감성 분석 (간단한 키워드 기반)
 */
function analyzeSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
  const bullishWords = ['bullish', 'buy', 'long', 'moon', 'pump', 'rally', 'surge', 'up', 'gain', 'rise'];
  const bearishWords = ['bearish', 'sell', 'short', 'crash', 'dump', 'fall', 'down', 'drop', 'decline'];
  
  const lowerText = text.toLowerCase();
  const bullishCount = bullishWords.filter(w => lowerText.includes(w)).length;
  const bearishCount = bearishWords.filter(w => lowerText.includes(w)).length;
  
  if (bullishCount > bearishCount) return 'bullish';
  if (bearishCount > bullishCount) return 'bearish';
  return 'neutral';
}

/**
 * 인플루언서 트윗 수집
 */
async function collectFromInfluencer(username: string): Promise<number> {
  console.log(`\n📱 @${username}`);
  
  try {
    // 프로필 가져오기
    const profile = await callDataApi('Twitter/get_user_profile_by_username', {
      query: { username }
    });
    
    const userId = profile?.result?.data?.user?.result?.rest_id;
    if (!userId) {
      console.log('  ❌ User ID not found');
      return 0;
    }
    
    // 최근 트윗 가져오기 (10개만)
    const tweetsData = await callDataApi('Twitter/get_user_tweets', {
      query: { user: userId, count: '10' }
    });
    
    const timeline = tweetsData?.result?.timeline;
    if (!timeline) {
      console.log('  ❌ No timeline');
      return 0;
    }
    
    // 트윗 파싱
    const tweets: any[] = [];
    for (const instruction of timeline.instructions || []) {
      if (instruction.type === 'TimelineAddEntries') {
        for (const entry of instruction.entries || []) {
          if (entry.entryId?.startsWith('tweet-')) {
            const result = entry.content?.itemContent?.tweet_results?.result;
            if (result) tweets.push(result);
          }
        }
      }
    }
    
    console.log(`  📊 ${tweets.length} tweets`);
    
    // 데이터베이스 저장
    const db = await getDb();
    if (!db) {
      console.log('  ❌ DB not available');
      return 0;
    }
    
    let saved = 0;
    for (const tweet of tweets) {
      const legacy = tweet.legacy;
      if (!legacy) continue;
      
      const text = legacy.full_text;
      const tickers = extractTickers(text);
      
      if (tickers.length === 0) continue;
      
      // 각 티커마다 별도 레코드 저장
      for (const ticker of tickers) {
        try {
          await db.insert(stockTweets).values({
            tweetId: `${tweet.rest_id}-${ticker}`,
            authorUsername: username,
            authorName: tweet.core?.user_results?.result?.legacy?.name || username,
            text,
            ticker,
            sentiment: analyzeSentiment(text),
            url: `https://twitter.com/${username}/status/${tweet.rest_id}`,
            likeCount: legacy.favorite_count || 0,
            retweetCount: legacy.retweet_count || 0,
            createdAt: new Date(legacy.created_at),
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
    console.error(`  ❌ Error processing @${username}:`, error.message);
    return 0;
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log('🚀 Starting Twitter data collection (simplified)');
  console.log(`📊 Processing ${TOP_INFLUENCERS.length} influencers`);
  
  let total = 0;
  
  for (let i = 0; i < TOP_INFLUENCERS.length; i++) {
    console.log(`\n[${i + 1}/${TOP_INFLUENCERS.length}]`);
    const saved = await collectFromInfluencer(TOP_INFLUENCERS[i]);
    total += saved;
    
    // Rate limit 방지 (10초 대기)
    if (i < TOP_INFLUENCERS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  console.log(`\n\n✅ Complete! Saved ${total} tweets`);
}

main().catch(console.error);
