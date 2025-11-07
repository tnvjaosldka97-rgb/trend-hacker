import { drizzle } from "drizzle-orm/mysql2";
import { stockTweets } from "./drizzle/schema.ts";
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

console.log("=== 최종 데이터 수집 결과 ===\n");

// 1. 전체 데이터
const total = await db.select({ count: sql`count(*)` }).from(stockTweets);
console.log(`📊 총 데이터: ${total[0].count}개`);

// 2. 최근 24시간
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
const recent = await db.select({ count: sql`count(*)` })
  .from(stockTweets)
  .where(sql`${stockTweets.createdAt} > ${oneDayAgo}`);
console.log(`📅 최근 24시간: ${recent[0].count}개`);

// 3. 소스별 통계
const twitter = await db.select({ count: sql`count(*)` })
  .from(stockTweets)
  .where(sql`${stockTweets.tweetId} NOT LIKE 'yt-%'`);
const youtube = await db.select({ count: sql`count(*)` })
  .from(stockTweets)
  .where(sql`${stockTweets.tweetId} LIKE 'yt-%'`);

console.log(`\n📱 Twitter: ${twitter[0].count}개`);
console.log(`📺 YouTube: ${youtube[0].count}개`);

// 4. TOP 10 종목
const topStocks = await db.select({
  ticker: stockTweets.ticker,
  count: sql`count(*)`,
})
  .from(stockTweets)
  .groupBy(stockTweets.ticker)
  .orderBy(sql`count(*) DESC`)
  .limit(10);

console.log("\n🔥 TOP 10 종목:");
topStocks.forEach((stock, i) => {
  console.log(`${i + 1}. ${stock.ticker}: ${stock.count}회`);
});

process.exit(0);
