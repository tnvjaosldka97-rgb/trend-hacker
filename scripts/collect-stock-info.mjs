import { drizzle } from 'drizzle-orm/mysql2';
import { stocks } from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

/**
 * Fetch stock information from Yahoo Finance API
 * @param {string} ticker - Stock ticker symbol
 * @returns {Promise<Object|null>} Stock information or null if failed
 */
async function fetchStockInfo(ticker) {
  try {
    // Using Yahoo Finance API via RapidAPI
    const response = await fetch(
      `https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/quotes?ticker=${ticker}`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
          'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      console.error(`❌ Failed to fetch ${ticker}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data || !data.body || data.body.length === 0) {
      console.error(`❌ No data for ${ticker}`);
      return null;
    }

    const stockData = data.body[0];
    
    return {
      ticker: ticker.toUpperCase(),
      name: stockData.longName || stockData.shortName || ticker,
      logoUrl: `https://logo.clearbit.com/${stockData.longName?.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      category: categorizeStock(stockData.sector || ''),
      exchange: stockData.exchange || 'NASDAQ',
      description: stockData.longBusinessSummary || ''
    };
  } catch (error) {
    console.error(`❌ Error fetching ${ticker}:`, error.message);
    return null;
  }
}

/**
 * Categorize stock based on sector
 * @param {string} sector - Stock sector
 * @returns {string} Category
 */
function categorizeStock(sector) {
  const sectorMap = {
    'Technology': 'Tech',
    'Financial Services': 'Finance',
    'Healthcare': 'Healthcare',
    'Consumer Cyclical': 'Consumer',
    'Communication Services': 'Communication',
    'Industrials': 'Industrial',
    'Consumer Defensive': 'Consumer',
    'Energy': 'Energy',
    'Utilities': 'Utilities',
    'Real Estate': 'Real Estate',
    'Basic Materials': 'Materials'
  };
  
  return sectorMap[sector] || 'Other';
}

/**
 * Get all unique tickers from stockTweets table
 * @returns {Promise<string[]>} Array of unique tickers
 */
async function getUniqueTickers() {
  const result = await db.execute(`
    SELECT DISTINCT ticker 
    FROM stockTweets 
    WHERE ticker IS NOT NULL 
    AND ticker != ''
    ORDER BY ticker
  `);
  
  return result[0].map(row => row.ticker);
}

/**
 * Upsert stock information into stocks table
 * @param {Object} stockInfo - Stock information
 */
async function upsertStock(stockInfo) {
  try {
    await db.insert(stocks)
      .values(stockInfo)
      .onDuplicateKeyUpdate({
        set: {
          name: stockInfo.name,
          logoUrl: stockInfo.logoUrl,
          category: stockInfo.category,
          exchange: stockInfo.exchange,
          description: stockInfo.description,
          updatedAt: new Date()
        }
      });
    
    console.log(`✅ Upserted ${stockInfo.ticker} - ${stockInfo.name}`);
  } catch (error) {
    console.error(`❌ Failed to upsert ${stockInfo.ticker}:`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting stock information collection...\n');
  
  // Get all unique tickers
  const tickers = await getUniqueTickers();
  console.log(`📊 Found ${tickers.length} unique tickers\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < tickers.length; i++) {
    const ticker = tickers[i];
    console.log(`[${i + 1}/${tickers.length}] Processing ${ticker}...`);
    
    // Fetch stock info
    const stockInfo = await fetchStockInfo(ticker);
    
    if (stockInfo) {
      await upsertStock(stockInfo);
      successCount++;
    } else {
      failCount++;
    }
    
    // Rate limiting: wait 2 seconds between requests
    if (i < tickers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
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
