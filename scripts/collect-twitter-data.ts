#!/usr/bin/env tsx
/**
 * Collect tweets from verified stock market influencers
 * 
 * This script:
 * 1. Loads influencer list
 * 2. Verifies account credibility (followers, verification)
 * 3. Collects recent tweets (24 hours)
 * 4. Extracts stock tickers
 * 5. Analyzes sentiment with AI
 * 6. Saves to database
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { callDataApi } from '../server/_core/dataApi';
import { invokeLLM } from '../server/_core/llm';
import { getDb } from '../server/db';
import { contents } from '../drizzle/schema';

interface Influencer {
  username: string;
  name: string;
  category: string;
}

interface TwitterProfile {
  result: {
    data: {
      user: {
        result: {
          rest_id: string;
          legacy: {
            screen_name: string;
            name: string;
            description: string;
            followers_count: number;
            verified: boolean;
            created_at: string;
          };
          is_blue_verified: boolean;
        };
      };
    };
  };
}

interface Tweet {
  rest_id: string;
  legacy: {
    full_text: string;
    created_at: string;
    retweet_count: number;
    favorite_count: number;
    reply_count: number;
  };
}

const MIN_FOLLOWERS = 5000;
const HOURS_LIMIT = 24;

/**
 * Load influencer list from JSON file
 */
function loadInfluencers(): Influencer[] {
  const filePath = join(process.cwd(), 'data', 'twitter-influencers-200.json');
  const data = readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Verify if account meets credibility criteria
 */
function isCredibleAccount(profile: any): boolean {
  try {
    const userData = profile?.result?.data?.user?.result;
    if (!userData) return false;

    const legacy = userData.legacy;
    const followersCount = legacy?.followers_count || 0;
    const verified = legacy?.verified || userData.is_blue_verified || false;

    // Must have 5000+ followers
    if (followersCount < MIN_FOLLOWERS) {
      console.log(`  ❌ Not enough followers: ${followersCount}`);
      return false;
    }

    console.log(`  ✅ Followers: ${followersCount.toLocaleString()}, Verified: ${verified}`);
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
  const stockMap: Record<string, string> = {
    'Tesla': 'TSLA',
    'TSLA': 'TSLA',
    'Nvidia': 'NVDA',
    'NVIDIA': 'NVDA',
    'NVDA': 'NVDA',
    'Apple': 'AAPL',
    'AAPL': 'AAPL',
    'Microsoft': 'MSFT',
    'MSFT': 'MSFT',
    'Amazon': 'AMZN',
    'AMZN': 'AMZN',
    'Google': 'GOOGL',
    'Alphabet': 'GOOGL',
    'GOOGL': 'GOOGL',
    'Meta': 'META',
    'Facebook': 'META',
    'META': 'META',
    'AMD': 'AMD',
    'Netflix': 'NFLX',
    'NFLX': 'NFLX',
    'Disney': 'DIS',
    'DIS': 'DIS',
    'Coinbase': 'COIN',
    'COIN': 'COIN',
    'Palantir': 'PLTR',
    'PLTR': 'PLTR',
    'Uber': 'UBER',
    'UBER': 'UBER',
    'Roblox': 'RBLX',
    'RBLX': 'RBLX',
  };
  
  for (const [name, ticker] of Object.entries(stockMap)) {
    const regex = new RegExp(`\\b${name}\\b`, 'gi');
    if (regex.test(text)) {
      tickers.add(ticker);
    }
  }
  
  return Array.from(tickers);
}

/**
 * Analyze tweet sentiment and extract insights using AI
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

언급된 종목: ${tickers.join(', ')}

다음 형식의 JSON으로 응답해주세요:
{
  "summary": "한글로 핵심 요약 (50자 이내)",
  "sentiment": "bullish 또는 bearish 또는 neutral",
  "stocks": ["종목1", "종목2"],
  "keyPoints": ["핵심 포인트1", "핵심 포인트2"]
}`;

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
    
    return analysis;
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
      query: {
        user: userId,
        count: '20'
      }
    });

    // 3. Parse tweets
    const tweets: Tweet[] = [];
    const timeline = tweetsData?.result?.timeline;
    if (timeline?.instructions) {
      for (const instruction of timeline.instructions) {
        if (instruction.type === 'TimelineAddEntries') {
          for (const entry of instruction.entries || []) {
            if (entry.entryId?.startsWith('tweet-')) {
              const tweetResult = entry.content?.itemContent?.tweet_results?.result;
              if (tweetResult) {
                tweets.push(tweetResult);
              }
            }
          }
        }
      }
    }

    console.log(`  📊 Found ${tweets.length} tweets`);

    // 4. Filter and analyze recent tweets
    let savedCount = 0;
    const db = await getDb();
    if (!db) {
      console.error('  ❌ Database not available');
      return 0;
    }

    for (const tweet of tweets) {
      if (!tweet.legacy) continue;
      const { full_text, created_at, favorite_count, retweet_count } = tweet.legacy;
      
      // Check if recent
      if (!isRecentTweet(created_at)) {
        continue;
      }

      // Extract tickers
      const tickers = extractTickers(full_text);
      if (tickers.length === 0) {
        continue; // Skip tweets without stock mentions
      }

      // No engagement filter - collect all tweets with stock mentions
      const engagement = favorite_count + retweet_count;

      console.log(`  💬 Analyzing: "${full_text.slice(0, 60)}..."`);
      console.log(`  📈 Tickers: ${tickers.join(', ')}, Engagement: ${engagement}`);

      // AI analysis
      const analysis = await analyzeTweet(full_text, tickers);

      // Save to database
      await db.insert(contents).values({
        influencerId: 0, // Will be updated later with proper influencer management
        platform: 'twitter',
        contentType: 'tweet',
        title: `@${influencer.username}: ${full_text.slice(0, 100)}`,
        description: full_text,
        url: `https://twitter.com/${influencer.username}/status/${tweet.rest_id}`,
        thumbnail: '',
        platformContentId: tweet.rest_id,
        publishedAt: new Date(created_at),
        viewCount: favorite_count,
        likeCount: favorite_count,
        commentCount: tweet.legacy.reply_count,
        transcript: full_text,
        aiSummary: analysis.summary,
        aiStocks: JSON.stringify(analysis.stocks),
        aiSentiment: analysis.sentiment,
        aiKeyPoints: JSON.stringify(analysis.keyPoints)
      });

      savedCount++;
      console.log(`  ✅ Saved to database`);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`  ✨ Saved ${savedCount} tweets from @${influencer.username}`);
    return savedCount;
    
  } catch (error) {
    console.error(`  ❌ Error processing @${influencer.username}:`, error);
    return 0;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Twitter data collection...\n');
  console.log('📋 Criteria:');
  console.log(`   - Minimum followers: ${MIN_FOLLOWERS.toLocaleString()}`);
  console.log(`   - Time window: Last ${HOURS_LIMIT} hours`);
  console.log(`   - Minimum engagement: None (all tweets collected)`);
  console.log(`   - Must mention stock tickers ($SYMBOL)\n`);

  const influencers = loadInfluencers();
  console.log(`📊 Loaded ${influencers.length} influencers\n`);

  let totalSaved = 0;

  for (let i = 0; i < influencers.length; i++) {
    const influencer = influencers[i];
    console.log(`[${i + 1}/${influencers.length}]`);
    
    const saved = await collectInfluencerTweets(influencer);
    totalSaved += saved;

    // Rate limiting between users
    if (i < influencers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Collection Summary');
  console.log('='.repeat(60));
  console.log(`✅ Total tweets saved: ${totalSaved}`);
  console.log(`📝 Influencers processed: ${influencers.length}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
