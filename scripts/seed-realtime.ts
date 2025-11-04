import { getDb } from '../server/db';
import { stockTweets } from '../drizzle/schema';

async function seedRealtimeData() {
  const db = await getDb();
  if (!db) {
    console.error('❌ Database not available');
    return;
  }

  const now = new Date();
  
  const data = [
    { ticker: 'TSLA', author: 'elonmusk', text: 'TSLA breaking $300! 🚀', sentiment: 'bullish' as const },
    { ticker: 'NVDA', author: 'jimcramer', text: 'NVDA AI chips demand is insane', sentiment: 'bullish' as const },
    { ticker: 'AAPL', author: 'MarkMinervini', text: 'AAPL consolidating nicely', sentiment: 'neutral' as const },
  ];

  for (const item of data) {
    try {
      await db.insert(stockTweets).values({
        tweetId: `realtime-${item.ticker}-${Date.now()}-${Math.random()}`,
        authorUsername: item.author,
        authorName: item.author,
        text: item.text,
        ticker: item.ticker,
        sentiment: item.sentiment,
        url: `https://twitter.com/${item.author}/status/test`,
        likeCount: 1000,
        retweetCount: 500,
        createdAt: now,
      });
      console.log('✅', item.ticker);
    } catch (error: any) {
      console.error('❌', item.ticker, error.message);
    }
  }
  
  console.log('✨ Done!');
}

seedRealtimeData();
