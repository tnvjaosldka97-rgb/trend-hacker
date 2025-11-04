import { callDataApi } from '../server/_core/dataApi';
import { invokeLLM } from '../server/_core/llm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getDb } from '../server/db';
import { contents } from '../drizzle/schema';

interface Influencer {
  username: string;
  name: string;
  category: string;
  followers?: string;
}

interface Tweet {
  rest_id: string;
  core?: {
    user_results?: {
      result?: {
        legacy?: {
          screen_name?: string;
          name?: string;
        };
      };
    };
  };
  legacy?: {
    full_text: string;
    created_at: string;
    retweet_count: number;
    favorite_count: number;
    reply_count: number;
  };
}

// 강화된 신뢰도 기준
const MIN_FOLLOWERS = 50000; // 5천 → 5만
const HOURS_LIMIT = 24;
const REQUIRE_VERIFIED = true; // 인증 배지 필수

// 전문성 키워드
const EXPERTISE_KEYWORDS = [
  'investor', 'trader', 'analyst', 'fund manager', 'portfolio manager',
  'financial', 'markets', 'stocks', 'trading', 'investing',
  'hedge fund', 'venture capital', 'vc', 'ceo', 'founder'
];

/**
 * Load influencer list from JSON file
 */
function loadInfluencers(): Influencer[] {
  const filePath = join(process.cwd(), 'data', 'twitter-influencers-200.json');
  const data = readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

/**
 * 강화된 신뢰도 검증
 */
function isCredibleAccount(profile: any): boolean {
  try {
    const userData = profile?.result?.data?.user?.result;
    if (!userData) return false;

    const legacy = userData.legacy;
    const followersCount = legacy?.followers_count || 0;
    const verified = legacy?.verified || userData.is_blue_verified || false;
    const description = (legacy?.description || '').toLowerCase();
    
    // 1. 팔로워 수 체크 (5만 이상)
    if (followersCount < MIN_FOLLOWERS) {
      console.log(`  ❌ Not enough followers: ${followersCount.toLocaleString()} (need ${MIN_FOLLOWERS.toLocaleString()}+)`);
      return false;
    }
    
    // 2. 인증 배지 필수
    if (REQUIRE_VERIFIED && !verified) {
      console.log(`  ❌ Not verified`);
      return false;
    }
    
    // 3. 전문성 체크 (프로필에 금융 관련 키워드 포함)
    const hasExpertise = EXPERTISE_KEYWORDS.some(keyword => 
      description.includes(keyword.toLowerCase())
    );
    
    if (!hasExpertise) {
      console.log(`  ❌ No financial expertise keywords in profile`);
      return false;
    }

    console.log(`  ✅ Followers: ${followersCount.toLocaleString()}, Verified: ${verified}, Expertise: Yes`);
    return true;
  } catch (error) {
    console.error('  ❌ Error checking credibility:', error);
    return false;
  }
}

/**
 * Check if tweet is recent (within 24 hours)
 */
function isRecentTweet(createdAt: string): boolean {
  const tweetDate = new Date(createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - tweetDate.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= HOURS_LIMIT;
}

/**
 * 대폭 확장된 종목 티커 매핑 (100개 이상)
 */
const STOCK_MAP: Record<string, string> = {
  // 빅테크
  'Apple': 'AAPL', 'AAPL': 'AAPL',
  'Microsoft': 'MSFT', 'MSFT': 'MSFT',
  'Amazon': 'AMZN', 'AMZN': 'AMZN',
  'Google': 'GOOGL', 'Alphabet': 'GOOGL', 'GOOGL': 'GOOGL', 'GOOG': 'GOOGL',
  'Meta': 'META', 'Facebook': 'META', 'META': 'META',
  'Tesla': 'TSLA', 'TSLA': 'TSLA',
  'Nvidia': 'NVDA', 'NVIDIA': 'NVDA', 'NVDA': 'NVDA',
  'Netflix': 'NFLX', 'NFLX': 'NFLX',
  
  // 반도체
  'AMD': 'AMD', 'Advanced Micro Devices': 'AMD',
  'Intel': 'INTC', 'INTC': 'INTC',
  'Qualcomm': 'QCOM', 'QCOM': 'QCOM',
  'Broadcom': 'AVGO', 'AVGO': 'AVGO',
  'Micron': 'MU', 'MU': 'MU',
  'ASML': 'ASML',
  'Taiwan Semiconductor': 'TSM', 'TSMC': 'TSM', 'TSM': 'TSM',
  
  // 전기차/자동차
  'Ford': 'F', 'F': 'F',
  'GM': 'GM', 'General Motors': 'GM',
  'Rivian': 'RIVN', 'RIVN': 'RIVN',
  'Lucid': 'LCID', 'LCID': 'LCID',
  'NIO': 'NIO',
  'XPeng': 'XPEV', 'XPEV': 'XPEV',
  'Li Auto': 'LI', 'LI': 'LI',
  
  // 금융
  'JPMorgan': 'JPM', 'JP Morgan': 'JPM', 'JPM': 'JPM',
  'Bank of America': 'BAC', 'BofA': 'BAC', 'BAC': 'BAC',
  'Wells Fargo': 'WFC', 'WFC': 'WFC',
  'Goldman Sachs': 'GS', 'GS': 'GS',
  'Morgan Stanley': 'MS', 'MS': 'MS',
  'Citigroup': 'C', 'Citi': 'C', 'C': 'C',
  'Visa': 'V', 'V': 'V',
  'Mastercard': 'MA', 'MA': 'MA',
  'PayPal': 'PYPL', 'PYPL': 'PYPL',
  'Square': 'SQ', 'Block': 'SQ', 'SQ': 'SQ',
  'Coinbase': 'COIN', 'COIN': 'COIN',
  
  // 소매/소비재
  'Walmart': 'WMT', 'WMT': 'WMT',
  'Target': 'TGT', 'TGT': 'TGT',
  'Costco': 'COST', 'COST': 'COST',
  'Home Depot': 'HD', 'HD': 'HD',
  'Nike': 'NKE', 'NKE': 'NKE',
  'Starbucks': 'SBUX', 'SBUX': 'SBUX',
  'McDonald': 'MCD', 'McDonalds': 'MCD', 'MCD': 'MCD',
  'Coca-Cola': 'KO', 'Coke': 'KO', 'KO': 'KO',
  'Pepsi': 'PEP', 'PepsiCo': 'PEP', 'PEP': 'PEP',
  
  // 헬스케어/제약
  'Johnson & Johnson': 'JNJ', 'JNJ': 'JNJ',
  'Pfizer': 'PFE', 'PFE': 'PFE',
  'Moderna': 'MRNA', 'MRNA': 'MRNA',
  'UnitedHealth': 'UNH', 'UNH': 'UNH',
  'Eli Lilly': 'LLY', 'LLY': 'LLY',
  'AbbVie': 'ABBV', 'ABBV': 'ABBV',
  
  // 에너지
  'Exxon': 'XOM', 'ExxonMobil': 'XOM', 'XOM': 'XOM',
  'Chevron': 'CVX', 'CVX': 'CVX',
  'ConocoPhillips': 'COP', 'COP': 'COP',
  
  // 항공우주/방위
  'Boeing': 'BA', 'BA': 'BA',
  'Lockheed Martin': 'LMT', 'LMT': 'LMT',
  'SpaceX': 'SPACE', // Private but often mentioned
  
  // 미디어/엔터테인먼트
  'Disney': 'DIS', 'DIS': 'DIS',
  'Warner Bros': 'WBD', 'WBD': 'WBD',
  'Paramount': 'PARA', 'PARA': 'PARA',
  'Spotify': 'SPOT', 'SPOT': 'SPOT',
  
  // 클라우드/소프트웨어
  'Salesforce': 'CRM', 'CRM': 'CRM',
  'Oracle': 'ORCL', 'ORCL': 'ORCL',
  'Adobe': 'ADBE', 'ADBE': 'ADBE',
  'ServiceNow': 'NOW', 'NOW': 'NOW',
  'Snowflake': 'SNOW', 'SNOW': 'SNOW',
  'Palantir': 'PLTR', 'PLTR': 'PLTR',
  'CrowdStrike': 'CRWD', 'CRWD': 'CRWD',
  
  // 통신
  'Verizon': 'VZ', 'VZ': 'VZ',
  'AT&T': 'T', 'ATT': 'T', 'T': 'T',
  'T-Mobile': 'TMUS', 'TMUS': 'TMUS',
  
  // 기타 인기 종목
  'Uber': 'UBER', 'UBER': 'UBER',
  'Lyft': 'LYFT', 'LYFT': 'LYFT',
  'Airbnb': 'ABNB', 'ABNB': 'ABNB',
  'DoorDash': 'DASH', 'DASH': 'DASH',
  'Roblox': 'RBLX', 'RBLX': 'RBLX',
  'Unity': 'U', 'U': 'U',
  'Snap': 'SNAP', 'Snapchat': 'SNAP', 'SNAP': 'SNAP',
  'Pinterest': 'PINS', 'PINS': 'PINS',
  'Reddit': 'RDDT', 'RDDT': 'RDDT',
  'Robinhood': 'HOOD', 'HOOD': 'HOOD',
  
  // ETF
  'SPY': 'SPY', 'S&P 500': 'SPY',
  'QQQ': 'QQQ', 'Nasdaq': 'QQQ',
  'DIA': 'DIA', 'Dow Jones': 'DIA',
  'IWM': 'IWM', 'Russell 2000': 'IWM',
  'VTI': 'VTI',
  'VOO': 'VOO',
};

/**
 * Extract stock tickers from text
 */
function extractTickers(text: string): string[] {
  const tickers = new Set<string>();
  
  // 1. Match $TICKER pattern
  const tickerRegex = /\$([A-Z]{1,5})\b/g;
  const tickerMatches = text.match(tickerRegex);
  if (tickerMatches) {
    tickerMatches.forEach(m => tickers.add(m.slice(1)));
  }
  
  // 2. Match company names and convert to tickers
  for (const [name, ticker] of Object.entries(STOCK_MAP)) {
    const regex = new RegExp(`\\b${name}\\b`, 'gi');
    if (regex.test(text)) {
      tickers.add(ticker);
    }
  }
  
  return Array.from(tickers);
}

/**
 * AI로 종목 추출 및 감성 분석
 */
async function analyzeTweet(text: string, tickers: string[]): Promise<{
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  stocks: string[];
  keyPoints: string[];
}> {
  try {
    const prompt = `다음 트윗을 분석해주세요:

"${text}"

${tickers.length > 0 ? `이미 발견된 종목: ${tickers.join(', ')}` : ''}

다음 형식의 JSON으로 응답해주세요:
{
  "summary": "한글로 핵심 요약 (50자 이내)",
  "sentiment": "bullish 또는 bearish 또는 neutral",
  "stocks": ["종목 티커들 (예: TSLA, NVDA)"],
  "keyPoints": ["핵심 포인트1", "핵심 포인트2"]
}

주의: stocks 배열에는 반드시 미국 주식 티커 심볼만 포함하세요. 티커가 없으면 빈 배열을 반환하세요.`;

    const response = await invokeLLM({
      messages: [
        { role: 'system', content: '당신은 주식 시장 분석 전문가입니다. 트윗을 분석하여 투자 인사이트를 추출합니다.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'tweet_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              summary: { type: 'string', description: '한글 요약' },
              sentiment: { type: 'string', enum: ['bullish', 'bearish', 'neutral'] },
              stocks: { type: 'array', items: { type: 'string' } },
              keyPoints: { type: 'array', items: { type: 'string' } }
            },
            required: ['summary', 'sentiment', 'stocks', 'keyPoints'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    const analysis = JSON.parse(content);
    
    // AI가 찾은 종목과 기존 티커 합치기
    const allStocks = new Set([...tickers, ...analysis.stocks]);
    
    return {
      ...analysis,
      stocks: Array.from(allStocks)
    };
  } catch (error) {
    console.error('  ❌ AI analysis failed:', error);
    return {
      summary: text.slice(0, 100),
      sentiment: 'neutral',
      stocks: tickers,
      keyPoints: []
    };
  }
}

/**
 * Collect tweets from a single influencer
 */
async function collectInfluencerTweets(influencer: Influencer): Promise<number> {
  console.log(`\n📱 Processing @${influencer.username} (${influencer.name})`);
  
  try {
    // 1. Get profile to verify credibility
    console.log('  🔍 Checking profile...');
    const profile = await callDataApi('Twitter/get_user_profile_by_username', {
      query: { username: influencer.username }
    });

    if (!isCredibleAccount(profile)) {
      console.log('  ⏭️  Skipping: Does not meet credibility criteria');
      return 0;
    }

    const userId = profile.result.data.user.result.rest_id;
    
    // 2. Get recent tweets
    console.log('  📥 Fetching tweets...');
    const tweetsData = await callDataApi('Twitter/get_user_tweets', {
      query: { user: userId, count: '20' }
    });

    // Parse tweets
    const timeline = tweetsData.result?.timeline;
    if (!timeline) {
      console.log('  ❌ No timeline data');
      return 0;
    }

    const instructions = timeline.instructions || [];
    const tweets: Tweet[] = [];

    for (const instruction of instructions) {
      if (instruction.type === 'TimelineAddEntries') {
        const entries = instruction.entries || [];
        for (const entry of entries) {
          if (entry.entryId?.startsWith('tweet-')) {
            const content = entry.content;
            if (content?.itemContent?.tweet_results?.result) {
              tweets.push(content.itemContent.tweet_results.result);
            }
          }
        }
      }
    }

    console.log(`  📊 Found ${tweets.length} tweets`);

    // 3. Process each tweet
    let savedCount = 0;
    const db = await getDb();
    if (!db) {
      console.error('  ❌ Database not available');
      return 0;
    }

    for (const tweet of tweets) {
      const legacy = tweet.legacy;
      if (!legacy) continue;

      const text = legacy.full_text;
      const createdAt = legacy.created_at;

      // Check if recent
      if (!isRecentTweet(createdAt)) continue;

      console.log(`  💬 Analyzing: "${text.slice(0, 60)}..."`);

      // Extract tickers
      const tickers = extractTickers(text);
      
      // AI analysis (will find more stocks)
      const analysis = await analyzeTweet(text, tickers);
      
      // Skip if no stocks found
      if (analysis.stocks.length === 0) {
        console.log(`  ⏭️  No stocks mentioned`);
        continue;
      }

      console.log(`  📈 Tickers: ${analysis.stocks.join(', ')}, Sentiment: ${analysis.sentiment}`);

      // Calculate engagement
      const engagement = (legacy.retweet_count || 0) + (legacy.favorite_count || 0);

      // Save to database
      try {
        await db.insert(contents).values({
          influencerId: 0, // TODO: Link to influencer
          platform: 'twitter',
          contentType: 'tweet',
          title: `@${influencer.username}: ${text.slice(0, 100)}`,
          description: text,
          url: `https://twitter.com/${influencer.username}/status/${tweet.rest_id}`,
          platformContentId: tweet.rest_id,
          publishedAt: new Date(createdAt),
          likeCount: legacy.favorite_count || 0,
          commentCount: legacy.reply_count || 0,
          aiSummary: analysis.summary,
          aiStocks: JSON.stringify(analysis.stocks),
          aiSentiment: analysis.sentiment,
          aiKeyPoints: JSON.stringify(analysis.keyPoints),
          createdAt: new Date(),
        });
        console.log(`  ✅ Saved to database`);
        savedCount++;
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`  ⏭️  Already exists`);
        } else {
          console.error(`  ❌ Failed to save:`, error.message);
        }
      }
    }

    console.log(`  ✨ Saved ${savedCount} tweets from @${influencer.username}`);
    return savedCount;
  } catch (error: any) {
    console.error(`  ❌ Error processing @${influencer.username}:`, error.message);
    return 0;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Twitter data collection...');
  console.log('📋 Enhanced Credibility Criteria:');
  console.log(`   - Minimum followers: ${MIN_FOLLOWERS.toLocaleString()}`);
  console.log(`   - Verified badge: ${REQUIRE_VERIFIED ? 'Required' : 'Optional'}`);
  console.log(`   - Expertise keywords: Required`);
  console.log(`   - Time window: Last ${HOURS_LIMIT} hours`);
  console.log(`   - Stock ticker mapping: ${Object.keys(STOCK_MAP).length} entries`);

  const influencers = loadInfluencers();
  console.log(`📊 Loaded ${influencers.length} influencers`);

  let totalSaved = 0;
  let processedCount = 0;

  for (let i = 0; i < influencers.length; i++) {
    console.log(`\n[${i + 1}/${influencers.length}]`);
    const saved = await collectInfluencerTweets(influencers[i]);
    totalSaved += saved;
    processedCount++;

    // Add delay to avoid rate limiting
    if (i < influencers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n\n✅ Collection complete!');
  console.log(`📊 Processed: ${processedCount} influencers`);
  console.log(`💾 Saved: ${totalSaved} tweets`);
}

main().catch(console.error);
