import { getDb } from './db';
import { stockTweets } from '../drizzle/schema';
import { gte, desc } from 'drizzle-orm';

/**
 * Get realtime trending stocks (last 3 minutes)
 */
export async function getRealtimeTrending() {
  const db = await getDb();
  if (!db) return { stocks: [], lastUpdate: null, nextUpdate: null, totalTweets: 0 };

  const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
  
  const tweets = await db.select().from(stockTweets)
    .where(gte(stockTweets.createdAt, threeMinutesAgo))
    .orderBy(desc(stockTweets.createdAt));

  const stockMap = new Map();
  
  for (const tweet of tweets) {
    const ticker = tweet.ticker;
    if (!ticker) continue;

    if (!stockMap.has(ticker)) {
      stockMap.set(ticker, {
        ticker,
        count: 0,
        bullish: 0,
        bearish: 0,
        neutral: 0,
        latestTweet: '',
        latestTweetUrl: '',
        latestTweetAuthor: '',
        latestTweetTime: null
      });
    }

    const stock = stockMap.get(ticker);
    stock.count++;
    
    if (tweet.sentiment === 'bullish') stock.bullish++;
    else if (tweet.sentiment === 'bearish') stock.bearish++;
    else stock.neutral++;

    if (!stock.latestTweet) {
      stock.latestTweet = tweet.text.slice(0, 100);
      stock.latestTweetUrl = tweet.url;
      stock.latestTweetAuthor = tweet.authorUsername;
      stock.latestTweetTime = tweet.createdAt;
    }
  }

  const stocks = Array.from(stockMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Calculate next update (next 3-minute mark)
  const now = new Date();
  const nextUpdate = new Date(Math.ceil(now.getTime() / (3 * 60 * 1000)) * (3 * 60 * 1000));
  
  return {
    stocks,
    lastUpdate: tweets.length > 0 ? tweets[0].collectedAt : null,
    nextUpdate,
    totalTweets: tweets.length
  };
}

/**
 * Get today's trending stocks (last 24 hours)
 */
export async function getTodayTrending() {
  const db = await getDb();
  if (!db) return { stocks: [], hourlyData: [], totalTweets: 0 };

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const tweets = await db.select().from(stockTweets)
    .where(gte(stockTweets.createdAt, oneDayAgo))
    .orderBy(desc(stockTweets.createdAt));

  const stockMap = new Map();
  const hourlyMap = new Map();

  for (const tweet of tweets) {
    const ticker = tweet.ticker;
    if (!ticker) continue;

    // Hourly distribution
    const hour = new Date(tweet.createdAt).getHours();
    hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);

    if (!stockMap.has(ticker)) {
      stockMap.set(ticker, {
        ticker,
        count: 0,
        bullish: 0,
        bearish: 0,
        neutral: 0,
        sentiment: 'neutral',
        latestTweet: '',
        latestTweetUrl: '',
        latestTweetAuthor: '',
        latestTweetTime: null
      });
    }

    const stock = stockMap.get(ticker);
    stock.count++;
    
    if (tweet.sentiment === 'bullish') stock.bullish++;
    else if (tweet.sentiment === 'bearish') stock.bearish++;
    else stock.neutral++;

    if (!stock.latestTweet) {
      stock.latestTweet = tweet.text.slice(0, 100);
      stock.latestTweetUrl = tweet.url;
      stock.latestTweetAuthor = tweet.authorUsername;
      stock.latestTweetTime = tweet.createdAt;
    }
  }

  // Calculate overall sentiment for each stock
  for (const stock of Array.from(stockMap.values())) {
    if (stock.bullish > stock.bearish && stock.bullish > stock.neutral) {
      stock.sentiment = 'bullish';
    } else if (stock.bearish > stock.bullish && stock.bearish > stock.neutral) {
      stock.sentiment = 'bearish';
    } else {
      stock.sentiment = 'neutral';
    }
  }

  const stocks = Array.from(stockMap.values())
    .sort((a, b) => b.count - a.count);

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourlyMap.get(i) || 0
  }));

  return {
    stocks,
    hourlyData,
    totalTweets: tweets.length
  };
}

/**
 * Get weekly trending stocks (last 7 days)
 */
export async function getWeeklyTrending() {
  const db = await getDb();
  if (!db) return { stocks: [], dailyData: [], totalTweets: 0 };

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const tweets = await db.select().from(stockTweets)
    .where(gte(stockTweets.createdAt, sevenDaysAgo))
    .orderBy(desc(stockTweets.createdAt));

  const stockMap = new Map();
  const dailyMap = new Map();

  for (const tweet of tweets) {
    const ticker = tweet.ticker;
    if (!ticker) continue;

    // Daily distribution
    const day = new Date(tweet.createdAt).toISOString().split('T')[0];
    dailyMap.set(day, (dailyMap.get(day) || 0) + 1);

    if (!stockMap.has(ticker)) {
      stockMap.set(ticker, {
        ticker,
        count: 0,
        bullish: 0,
        bearish: 0,
        neutral: 0,
        sentiment: 'neutral',
        latestTweet: '',
        latestTweetUrl: '',
        latestTweetAuthor: '',
        latestTweetTime: null
      });
    }

    const stock = stockMap.get(ticker);
    stock.count++;
    
    if (tweet.sentiment === 'bullish') stock.bullish++;
    else if (tweet.sentiment === 'bearish') stock.bearish++;
    else stock.neutral++;

    if (!stock.latestTweet) {
      stock.latestTweet = tweet.text.slice(0, 100);
      stock.latestTweetUrl = tweet.url;
      stock.latestTweetAuthor = tweet.authorUsername;
      stock.latestTweetTime = tweet.createdAt;
    }
  }

  // Calculate overall sentiment
  for (const stock of Array.from(stockMap.values())) {
    if (stock.bullish > stock.bearish && stock.bullish > stock.neutral) {
      stock.sentiment = 'bullish';
    } else if (stock.bearish > stock.bullish && stock.bearish > stock.neutral) {
      stock.sentiment = 'bearish';
    } else {
      stock.sentiment = 'neutral';
    }
  }

  const stocks = Array.from(stockMap.values())
    .sort((a, b) => b.count - a.count);

  const dailyData = Array.from(dailyMap.entries())
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day));

  return {
    stocks,
    dailyData,
    totalTweets: tweets.length
  };
}
