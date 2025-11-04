import { getDb } from '../server/db.ts';
import { contents } from '../drizzle/schema.ts';
import { sql } from 'drizzle-orm';

const db = await getDb();
if (!db) {
  console.log('❌ Database not available');
  process.exit(1);
}

console.log('🧹 Cleaning invalid ticker data...');

// 1글자 티커 삭제
const result = await db.delete(contents).where(
  sql`JSON_LENGTH(aiStocks) = 1 AND JSON_EXTRACT(aiStocks, '$[0]') REGEXP '^[A-Z]{1}$'`
);

console.log(`✅ Deleted ${result.rowsAffected || 0} rows with invalid single-letter tickers`);

// 통계 출력
const allContents = await db.select().from(contents);
console.log(`📊 Total remaining contents: ${allContents.length}`);

const stockCounts = new Map();
for (const content of allContents) {
  if (content.aiStocks) {
    try {
      const stocks = JSON.parse(content.aiStocks);
      stocks.forEach(stock => {
        stockCounts.set(stock, (stockCounts.get(stock) || 0) + 1);
      });
    } catch (e) {
      // ignore
    }
  }
}

console.log(`📈 Unique stocks: ${stockCounts.size}`);
console.log('Top 10 stocks:');
const sorted = Array.from(stockCounts.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

sorted.forEach(([stock, count], i) => {
  console.log(`  ${i + 1}. ${stock}: ${count} mentions`);
});

process.exit(0);
