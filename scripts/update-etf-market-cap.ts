import { getDb } from '../server/db';
import { etfHoldings } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

interface StockQuote {
  symbol: string;
  marketCap?: number;
  regularMarketPrice?: number;
}

async function getStockMarketCap(ticker: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;
    const params = new URLSearchParams({
      region: 'US',
      lang: 'en-US',
      includePrePost: 'false',
      interval: '1d',
      range: '1d',
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`  ${ticker}: HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data && data.chart && data.chart.result && data.chart.result[0]) {
      const meta = data.chart.result[0].meta;
      const marketCap = meta.marketCap;

      if (marketCap) {
        console.log(`  ${ticker}: Market Cap = $${(marketCap / 1e9).toFixed(1)}B`);
        return marketCap;
      }
    }

    console.log(`  ${ticker}: No market cap data`);
    return null;
  } catch (error) {
    console.error(`  ${ticker}: Error - ${error}`);
    return null;
  }
}

async function updateETFMarketCaps(etfTicker: string) {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing ${etfTicker}`);
  console.log(`${'='.repeat(60)}`);

  // Get all holdings for this ETF
  const holdings = await db.select().from(etfHoldings).where(eq(etfHoldings.etfTicker, etfTicker));

  console.log(`Found ${holdings.length} holdings for ${etfTicker}`);

  let updatedCount = 0;

  for (const holding of holdings) {
    const marketCap = await getStockMarketCap(holding.stockTicker);

    if (marketCap) {
      // Update the holding with market cap
      await db
        .update(etfHoldings)
        .set({
          marketCap: marketCap.toString(), // Store as string to avoid integer overflow
          updatedAt: new Date(),
        })
        .where(eq(etfHoldings.id, holding.id));

      updatedCount++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`Updated ${updatedCount}/${holdings.length} holdings with market cap data`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('ETF Market Cap Update Script');
  console.log('='.repeat(60));

  const etfList = ['SPY', 'QQQ', 'VOO', 'VTI', 'IWM', 'XLK', 'XLF', 'XLE', 'XLV', 'ARKK'];

  for (const etfTicker of etfList) {
    await updateETFMarketCaps(etfTicker);
    // Rate limiting between ETFs
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('ETF market cap update completed!');
  console.log('='.repeat(60));

  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
