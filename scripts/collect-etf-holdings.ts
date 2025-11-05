#!/usr/bin/env tsx
/**
 * ETF Holdings Data Collection from SEC EDGAR
 * 
 * This script fetches real ETF holdings data from SEC EDGAR filings (N-PORT)
 * and stores it in the database.
 * 
 * Usage:
 *   npx tsx scripts/collect-etf-holdings.ts
 */

import { getDb } from '../server/db';
import { etfHoldings, stocks } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// Major ETFs to track (with their CIK numbers)
const ETF_LIST = [
  { ticker: 'SPY', cik: '0000884394', name: 'SPDR S&P 500 ETF Trust' },
  { ticker: 'QQQ', cik: '0001067839', name: 'Invesco QQQ Trust' },
  { ticker: 'VOO', cik: '0000862084', name: 'Vanguard S&P 500 ETF' },
  { ticker: 'VTI', cik: '0000862084', name: 'Vanguard Total Stock Market ETF' },
  { ticker: 'IWM', cik: '0001100663', name: 'iShares Russell 2000 ETF' },
  { ticker: 'XLK', cik: '0000884394', name: 'Technology Select Sector SPDR Fund' },
  { ticker: 'XLF', cik: '0000884394', name: 'Financial Select Sector SPDR Fund' },
  { ticker: 'XLE', cik: '0000884394', name: 'Energy Select Sector SPDR Fund' },
  { ticker: 'XLV', cik: '0000884394', name: 'Health Care Select Sector SPDR Fund' },
  { ticker: 'ARKK', cik: '0001579982', name: 'ARK Innovation ETF' },
];

interface Holding {
  ticker: string;
  name: string;
  cusip: string;
  shares: number;
  value: number;
  weight: number;
}

/**
 * Fetch ETF holdings from SEC EDGAR
 */
async function fetchETFHoldingsFromSEC(cik: string, ticker: string): Promise<Holding[]> {
  try {
    console.log(`[${ticker}] Fetching from SEC EDGAR (CIK: ${cik})...`);
    
    // SEC EDGAR API endpoint
    const submissionsUrl = `https://data.sec.gov/submissions/CIK${cik.padStart(10, '0')}.json`;
    
    const response = await fetch(submissionsUrl, {
      headers: {
        'User-Agent': 'TrendHacker contact@trendhacker.com',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Find the most recent N-PORT filing
    const filings = data.filings?.recent;
    if (!filings) {
      console.log(`[${ticker}] No filings found`);
      return [];
    }

    let nportIndex = -1;
    for (let i = 0; i < filings.form.length; i++) {
      if (filings.form[i] === 'NPORT-P') {
        nportIndex = i;
        break;
      }
    }

    if (nportIndex === -1) {
      console.log(`[${ticker}] No N-PORT filing found`);
      return [];
    }

    const accessionNumber = filings.accessionNumber[nportIndex].replace(/-/g, '');
    const filingDate = filings.filingDate[nportIndex];
    
    console.log(`[${ticker}] Found N-PORT filing: ${filingDate}`);

    // Fetch the actual filing document
    const filingUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=NPORT-P&dateb=&owner=exclude&count=1&search_text=`;
    
    // For now, return empty array as parsing N-PORT XML is complex
    // We'll use a simpler approach with Yahoo Finance API instead
    console.log(`[${ticker}] N-PORT parsing not implemented yet`);
    return [];

  } catch (error) {
    console.error(`[${ticker}] Error fetching from SEC:`, error);
    return [];
  }
}

/**
 * Fetch ETF holdings from Yahoo Finance (simpler alternative)
 */
async function fetchETFHoldingsFromYahoo(ticker: string): Promise<Holding[]> {
  try {
    console.log(`[${ticker}] Fetching from Yahoo Finance...`);
    
    // Yahoo Finance doesn't have a direct API, but we can scrape the holdings page
    const url = `https://finance.yahoo.com/quote/${ticker}/holdings`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const holdings: Holding[] = [];

    // Try to extract holdings from embedded JSON data
    const scriptMatch = html.match(/"holdings":\s*{[^}]*"holdings":\s*\[([^\]]+)\]/);
    if (scriptMatch) {
      try {
        const holdingsJson = JSON.parse(`[${scriptMatch[1]}]`);
        
        for (const item of holdingsJson) {
          if (item.symbol) {
            holdings.push({
              ticker: item.symbol,
              name: item.holdingName || item.symbol,
              cusip: item.cusip || '',
              shares: item.shares || 0,
              value: item.value || 0,
              weight: (item.holdingPercent || 0) * 100,
            });
          }
        }
      } catch (e) {
        console.error(`[${ticker}] Failed to parse holdings JSON`);
      }
    }

    // If no data found, try alternative scraping
    if (holdings.length === 0) {
      console.log(`[${ticker}] Trying alternative scraping method...`);
      
      // Look for table data in the HTML
      const tableRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
      const rows = html.match(tableRegex) || [];
      
      for (const row of rows) {
        const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const cells = [];
        let match;
        
        while ((match = cellRegex.exec(row)) !== null) {
          cells.push(match[1].replace(/<[^>]*>/g, '').trim());
        }
        
        // Typical format: [Symbol, Name, % Assets, Shares, Value]
        if (cells.length >= 3 && cells[0].match(/^[A-Z]{1,5}$/)) {
          const weight = parseFloat(cells[2].replace('%', ''));
          if (!isNaN(weight) && weight > 0) {
            holdings.push({
              ticker: cells[0],
              name: cells[1] || cells[0],
              cusip: '',
              shares: cells[3] ? parseInt(cells[3].replace(/,/g, '')) : 0,
              value: cells[4] ? parseFloat(cells[4].replace(/[$,]/g, '')) : 0,
              weight: weight,
            });
          }
        }
      }
    }

    console.log(`[${ticker}] Found ${holdings.length} holdings`);
    return holdings.slice(0, 50); // Top 50 holdings

  } catch (error) {
    console.error(`[${ticker}] Error fetching from Yahoo:`, error);
    return [];
  }
}

/**
 * Save holdings to database
 */
async function saveHoldings(etfTicker: string, holdings: Holding[]) {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  try {
    // Delete existing holdings for this ETF
    await db.delete(etfHoldings).where(eq(etfHoldings.etfTicker, etfTicker));
    console.log(`[${etfTicker}] Cleared existing holdings`);

    // Insert new holdings
    for (const holding of holdings) {
      await db.insert(etfHoldings).values({
        etfTicker,
        stockTicker: holding.ticker,
        weight: Math.round(holding.weight * 100), // store as integer (850 = 8.5%)
        shares: holding.shares || null,
        marketValue: holding.value ? Math.round(holding.value * 100) : null,
      });

      // Also update stocks table
      const existingStock = await db.select().from(stocks).where(eq(stocks.ticker, holding.ticker)).limit(1);
      
      if (existingStock.length === 0) {
        await db.insert(stocks).values({
          ticker: holding.ticker,
          name: holding.name,
        });
      }
    }

    console.log(`[${etfTicker}] Saved ${holdings.length} holdings to database`);

  } catch (error) {
    console.error(`[${etfTicker}] Error saving holdings:`, error);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('ETF Holdings Data Collection (Real Data)');
  console.log('='.repeat(60));
  console.log(`Collecting holdings for ${ETF_LIST.length} ETFs`);
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const etf of ETF_LIST) {
    try {
      // Try Yahoo Finance first (simpler and more reliable)
      let holdings = await fetchETFHoldingsFromYahoo(etf.ticker);
      
      // If Yahoo fails, try SEC EDGAR
      if (holdings.length === 0) {
        holdings = await fetchETFHoldingsFromSEC(etf.cik, etf.ticker);
      }
      
      if (holdings.length > 0) {
        await saveHoldings(etf.ticker, holdings);
        successCount++;
      } else {
        console.log(`[${etf.ticker}] No holdings found`);
        failCount++;
      }

      // Wait 5 seconds between requests to avoid rate limiting
      console.log(`[${etf.ticker}] Waiting 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (error) {
      console.error(`[${etf.ticker}] Failed:`, error);
      failCount++;
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Collection Summary:');
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`  Total: ${ETF_LIST.length}`);
  console.log('='.repeat(60));
}

// Run the script
main().catch(console.error);
