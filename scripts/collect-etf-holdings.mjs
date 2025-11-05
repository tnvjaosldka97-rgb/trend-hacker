import { drizzle } from 'drizzle-orm/mysql2';
import { etfHoldings, stocks } from '../drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

/**
 * Fetch ETF holdings from Yahoo Finance API
 * @param {string} etfTicker - ETF ticker symbol
 * @returns {Promise<Array|null>} Holdings data or null if failed
 */
async function fetchETFHoldings(etfTicker) {
  try {
    // Using Yahoo Finance API via RapidAPI
    const response = await fetch(
      `https://yahoo-finance15.p.rapidapi.com/api/v1/markets/etf/holdings?ticker=${etfTicker}`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
          'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      console.error(`❌ Failed to fetch ${etfTicker}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data || !data.body || !data.body.holdings) {
      console.error(`❌ No holdings data for ${etfTicker}`);
      return null;
    }

    return data.body.holdings;
  } catch (error) {
    console.error(`❌ Error fetching ${etfTicker}:`, error.message);
    return null;
  }
}

/**
 * Upsert ETF holding into database
 * @param {string} etfTicker - ETF ticker
 * @param {Object} holding - Holding data
 */
async function upsertETFHolding(etfTicker, holding) {
  try {
    const holdingData = {
      etfTicker: etfTicker.toUpperCase(),
      stockTicker: holding.symbol.toUpperCase(),
      weight: Math.round(holding.weight * 100) / 100, // Convert to percentage
      shares: holding.shares || null,
      marketValue: holding.marketValue || null,
      updatedAt: new Date()
    };

    await db.insert(etfHoldings)
      .values(holdingData)
      .onDuplicateKeyUpdate({
        set: {
          weight: holdingData.weight,
          shares: holdingData.shares,
          marketValue: holdingData.marketValue,
          updatedAt: new Date()
        }
      });

    console.log(`  ✅ ${holding.symbol} - ${holdingData.weight}%`);
  } catch (error) {
    console.error(`  ❌ Failed to upsert ${holding.symbol}:`, error.message);
  }
}

/**
 * Collect ETF holdings for a specific ETF
 * @param {string} etfTicker - ETF ticker
 */
async function collectETFHoldings(etfTicker) {
  console.log(`\n📊 Collecting holdings for $${etfTicker}...`);
  
  const holdings = await fetchETFHoldings(etfTicker);
  
  if (!holdings || holdings.length === 0) {
    console.log(`  ⚠️  No holdings found for $${etfTicker}`);
    return;
  }

  console.log(`  Found ${holdings.length} holdings`);
  
  for (const holding of holdings) {
    await upsertETFHolding(etfTicker, holding);
    
    // Rate limiting: wait 1 second between inserts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`  ✅ Completed $${etfTicker}`);
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting ETF holdings collection...\n');
  
  // Popular ETFs to collect
  const etfs = [
    'SPY',   // S&P 500
    'QQQ',   // NASDAQ 100
    'VOO',   // Vanguard S&P 500
    'VTI',   // Vanguard Total Stock Market
    'IWM',   // Russell 2000
    'DIA',   // Dow Jones
    'ARKK',  // ARK Innovation
    'XLF',   // Financial Select Sector
    'XLE',   // Energy Select Sector
    'XLK',   // Technology Select Sector
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < etfs.length; i++) {
    const etf = etfs[i];
    
    try {
      await collectETFHoldings(etf);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to collect ${etf}:`, error.message);
      failCount++;
    }
    
    // Rate limiting: wait 5 seconds between ETFs
    if (i < etfs.length - 1) {
      console.log(`\n⏳ Waiting 5 seconds before next ETF...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log(`\n✅ Collection completed!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
