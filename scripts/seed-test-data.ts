import { getDb } from '../server/db';
import { stockTweets } from '../drizzle/schema';

const TEST_DATA = [
  // TSLA - 상승 의견
  { ticker: 'TSLA', author: 'elonmusk', name: 'Elon Musk', text: 'Tesla production hitting new records! $TSLA 🚀', sentiment: 'bullish', likes: 50000, retweets: 15000 },
  { ticker: 'TSLA', author: 'GaryBlack00', name: 'Gary Black', text: '$TSLA deliveries looking strong for Q4. Bullish on the stock.', sentiment: 'bullish', likes: 3200, retweets: 850 },
  { ticker: 'TSLA', author: 'SawyerMerritt', name: 'Sawyer Merritt', text: 'Tesla FSD improvements are incredible. $TSLA long term hold.', sentiment: 'bullish', likes: 4500, retweets: 1200 },
  
  // NVDA - 상승 의견
  { ticker: 'NVDA', author: 'CathieDWood', name: 'Cathie Wood', text: '$NVDA AI chip demand is insane. This is just the beginning.', sentiment: 'bullish', likes: 8900, retweets: 2300 },
  { ticker: 'NVDA', author: 'jimcramer', name: 'Jim Cramer', text: 'Nvidia is the pick of the year. $NVDA to the moon!', sentiment: 'bullish', likes: 5600, retweets: 1400 },
  
  // AAPL - 중립
  { ticker: 'AAPL', author: 'MarkMinervini', name: 'Mark Minervini', text: '$AAPL consolidating. Waiting for breakout signal.', sentiment: 'neutral', likes: 2100, retweets: 450 },
  { ticker: 'AAPL', author: 'allstarcharts', name: 'All Star Charts', text: 'Apple showing mixed signals. $AAPL needs volume.', sentiment: 'neutral', likes: 1800, retweets: 380 },
  
  // META - 상승
  { ticker: 'META', author: 'chamath', name: 'Chamath', text: '$META AI investments paying off big time. Zuck nailed it.', sentiment: 'bullish', likes: 7200, retweets: 1900 },
  
  // SPY - 하락 경고
  { ticker: 'SPY', author: 'TaviCosta', name: 'Tavi Costa', text: '$SPY showing weakness. Market correction incoming?', sentiment: 'bearish', likes: 3400, retweets: 920 },
  { ticker: 'SPY', author: 'LukeGromen', name: 'Luke Gromen', text: 'Macro headwinds building. $SPY vulnerable here.', sentiment: 'bearish', likes: 2800, retweets: 750 },
  
  // AMD - 상승
  { ticker: 'AMD', author: 'KimbleCharting', name: 'Kimble Charting', text: '$AMD breaking out of resistance. Technical setup looks great.', sentiment: 'bullish', likes: 2600, retweets: 680 },
  
  // MSFT - 상승
  { ticker: 'MSFT', author: 'profgalloway', name: 'Scott Galloway', text: 'Microsoft Azure growth is phenomenal. $MSFT undervalued.', sentiment: 'bullish', likes: 4100, retweets: 1050 },
  
  // GOOGL - 중립
  { ticker: 'GOOGL', author: 'AswathDamodaran', name: 'Aswath Damodaran', text: '$GOOGL valuation fair at current levels. Hold position.', sentiment: 'neutral', likes: 3300, retweets: 870 },
  
  // QQQ - 상승
  { ticker: 'QQQ', author: 'CarterBraxton', name: 'Carter Braxton', text: 'Tech sector momentum strong. $QQQ looking good for continuation.', sentiment: 'bullish', likes: 2900, retweets: 760 },
  
  // AMZN - 상승
  { ticker: 'AMZN', author: 'DanGramza', name: 'Dan Gramza', text: '$AMZN AWS revenue crushing it. Stock has room to run.', sentiment: 'bullish', likes: 3700, retweets: 950 },
];

async function seedTestData() {
  console.log('🌱 Seeding test data...');
  
  const db = await getDb();
  if (!db) {
    console.error('❌ Database not available');
    return;
  }
  
  let inserted = 0;
  const now = new Date();
  
  for (const data of TEST_DATA) {
    try {
      // 최근 3시간 내 랜덤 시간
      const hoursAgo = Math.random() * 3;
      const createdAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      
      await db.insert(stockTweets).values({
        tweetId: `test-${data.ticker}-${data.author}-${Date.now()}-${Math.random()}`,
        authorUsername: data.author,
        authorName: data.name,
        text: data.text,
        ticker: data.ticker,
        sentiment: data.sentiment as 'bullish' | 'bearish' | 'neutral',
        url: `https://twitter.com/${data.author}/status/test`,
        likeCount: data.likes,
        retweetCount: data.retweets,
        createdAt,
      });
      
      inserted++;
      console.log(`✅ ${data.ticker} by @${data.author}`);
    } catch (error: any) {
      console.error(`❌ Error inserting ${data.ticker}:`, error.message);
    }
  }
  
  console.log(`\n✨ Inserted ${inserted}/${TEST_DATA.length} test tweets`);
  
  // 통계 확인
  const stats = await db.execute(`
    SELECT 
      ticker,
      COUNT(*) as mentions,
      SUM(CASE WHEN sentiment = 'bullish' THEN 1 ELSE 0 END) as bullish,
      SUM(CASE WHEN sentiment = 'bearish' THEN 1 ELSE 0 END) as bearish,
      SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral
    FROM stockTweets
    GROUP BY ticker
    ORDER BY mentions DESC
  `);
  
  console.log('\n📊 Stock mentions:');
  stats[0].forEach((row: any) => {
    console.log(`  ${row.ticker}: ${row.mentions} (↑${row.bullish} ↓${row.bearish} →${row.neutral})`);
  });
}

seedTestData().catch(console.error);
