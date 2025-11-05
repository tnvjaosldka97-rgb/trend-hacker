#!/usr/bin/env tsx
/**
 * Seed ETF Holdings Data
 * 
 * This script populates the database with sample ETF holdings data
 * for major ETFs like SPY, QQQ, VOO, etc.
 * 
 * Usage:
 *   npx tsx scripts/seed-etf-holdings.ts
 */

import { getDb } from '../server/db';
import { etfHoldings, stocks } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// ETF Holdings Data (Top 10 holdings for each ETF)
const ETF_HOLDINGS_DATA = {
  'SPY': [ // SPDR S&P 500 ETF Trust
    { ticker: 'AAPL', name: 'Apple Inc.', weight: 7.2 },
    { ticker: 'MSFT', name: 'Microsoft Corporation', weight: 6.8 },
    { ticker: 'NVDA', name: 'NVIDIA Corporation', weight: 5.1 },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', weight: 3.8 },
    { ticker: 'META', name: 'Meta Platforms Inc.', weight: 2.4 },
    { ticker: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 2.1 },
    { ticker: 'GOOG', name: 'Alphabet Inc. Class C', weight: 1.8 },
    { ticker: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B', weight: 1.7 },
    { ticker: 'TSLA', name: 'Tesla Inc.', weight: 1.6 },
    { ticker: 'JPM', name: 'JPMorgan Chase & Co.', weight: 1.3 },
  ],
  'QQQ': [ // Invesco QQQ Trust (Nasdaq-100)
    { ticker: 'AAPL', name: 'Apple Inc.', weight: 8.9 },
    { ticker: 'MSFT', name: 'Microsoft Corporation', weight: 8.4 },
    { ticker: 'NVDA', name: 'NVIDIA Corporation', weight: 7.2 },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', weight: 5.6 },
    { ticker: 'META', name: 'Meta Platforms Inc.', weight: 4.8 },
    { ticker: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 2.9 },
    { ticker: 'GOOG', name: 'Alphabet Inc. Class C', weight: 2.7 },
    { ticker: 'TSLA', name: 'Tesla Inc.', weight: 2.4 },
    { ticker: 'AVGO', name: 'Broadcom Inc.', weight: 2.1 },
    { ticker: 'COST', name: 'Costco Wholesale Corporation', weight: 1.9 },
  ],
  'VOO': [ // Vanguard S&P 500 ETF
    { ticker: 'AAPL', name: 'Apple Inc.', weight: 7.1 },
    { ticker: 'MSFT', name: 'Microsoft Corporation', weight: 6.7 },
    { ticker: 'NVDA', name: 'NVIDIA Corporation', weight: 5.0 },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', weight: 3.7 },
    { ticker: 'META', name: 'Meta Platforms Inc.', weight: 2.3 },
    { ticker: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 2.0 },
    { ticker: 'GOOG', name: 'Alphabet Inc. Class C', weight: 1.7 },
    { ticker: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B', weight: 1.6 },
    { ticker: 'TSLA', name: 'Tesla Inc.', weight: 1.5 },
    { ticker: 'JPM', name: 'JPMorgan Chase & Co.', weight: 1.2 },
  ],
  'VTI': [ // Vanguard Total Stock Market ETF
    { ticker: 'AAPL', name: 'Apple Inc.', weight: 5.8 },
    { ticker: 'MSFT', name: 'Microsoft Corporation', weight: 5.5 },
    { ticker: 'NVDA', name: 'NVIDIA Corporation', weight: 4.1 },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', weight: 3.0 },
    { ticker: 'META', name: 'Meta Platforms Inc.', weight: 1.9 },
    { ticker: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 1.6 },
    { ticker: 'GOOG', name: 'Alphabet Inc. Class C', weight: 1.4 },
    { ticker: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B', weight: 1.3 },
    { ticker: 'TSLA', name: 'Tesla Inc.', weight: 1.2 },
    { ticker: 'JPM', name: 'JPMorgan Chase & Co.', weight: 1.0 },
  ],
  'IWM': [ // iShares Russell 2000 ETF (Small Cap)
    { ticker: 'SMCI', name: 'Super Micro Computer Inc.', weight: 0.8 },
    { ticker: 'HIMS', name: 'Hims & Hers Health Inc.', weight: 0.7 },
    { ticker: 'RKLB', name: 'Rocket Lab USA Inc.', weight: 0.6 },
    { ticker: 'PLTR', name: 'Palantir Technologies Inc.', weight: 0.5 },
    { ticker: 'HOOD', name: 'Robinhood Markets Inc.', weight: 0.5 },
    { ticker: 'CRWD', name: 'CrowdStrike Holdings Inc.', weight: 0.4 },
    { ticker: 'COIN', name: 'Coinbase Global Inc.', weight: 0.4 },
    { ticker: 'NET', name: 'Cloudflare Inc.', weight: 0.4 },
    { ticker: 'DKNG', name: 'DraftKings Inc.', weight: 0.3 },
    { ticker: 'RIVN', name: 'Rivian Automotive Inc.', weight: 0.3 },
  ],
  'XLK': [ // Technology Select Sector SPDR Fund
    { ticker: 'AAPL', name: 'Apple Inc.', weight: 21.5 },
    { ticker: 'MSFT', name: 'Microsoft Corporation', weight: 20.8 },
    { ticker: 'NVDA', name: 'NVIDIA Corporation', weight: 15.2 },
    { ticker: 'AVGO', name: 'Broadcom Inc.', weight: 4.9 },
    { ticker: 'CRM', name: 'Salesforce Inc.', weight: 3.1 },
    { ticker: 'ORCL', name: 'Oracle Corporation', weight: 2.8 },
    { ticker: 'CSCO', name: 'Cisco Systems Inc.', weight: 2.5 },
    { ticker: 'ACN', name: 'Accenture plc', weight: 2.3 },
    { ticker: 'AMD', name: 'Advanced Micro Devices Inc.', weight: 2.1 },
    { ticker: 'ADBE', name: 'Adobe Inc.', weight: 1.9 },
  ],
  'XLF': [ // Financial Select Sector SPDR Fund
    { ticker: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B', weight: 12.8 },
    { ticker: 'JPM', name: 'JPMorgan Chase & Co.', weight: 10.2 },
    { ticker: 'V', name: 'Visa Inc.', weight: 7.8 },
    { ticker: 'MA', name: 'Mastercard Inc.', weight: 6.5 },
    { ticker: 'BAC', name: 'Bank of America Corporation', weight: 4.9 },
    { ticker: 'WFC', name: 'Wells Fargo & Company', weight: 3.8 },
    { ticker: 'GS', name: 'The Goldman Sachs Group Inc.', weight: 2.9 },
    { ticker: 'MS', name: 'Morgan Stanley', weight: 2.7 },
    { ticker: 'SPGI', name: 'S&P Global Inc.', weight: 2.4 },
    { ticker: 'AXP', name: 'American Express Company', weight: 2.1 },
  ],
  'XLE': [ // Energy Select Sector SPDR Fund
    { ticker: 'XOM', name: 'Exxon Mobil Corporation', weight: 22.5 },
    { ticker: 'CVX', name: 'Chevron Corporation', weight: 15.8 },
    { ticker: 'COP', name: 'ConocoPhillips', weight: 7.2 },
    { ticker: 'SLB', name: 'Schlumberger Limited', weight: 5.9 },
    { ticker: 'EOG', name: 'EOG Resources Inc.', weight: 4.8 },
    { ticker: 'MPC', name: 'Marathon Petroleum Corporation', weight: 4.2 },
    { ticker: 'PSX', name: 'Phillips 66', weight: 3.9 },
    { ticker: 'VLO', name: 'Valero Energy Corporation', weight: 3.5 },
    { ticker: 'OXY', name: 'Occidental Petroleum Corporation', weight: 3.1 },
    { ticker: 'WMB', name: 'The Williams Companies Inc.', weight: 2.8 },
  ],
  'XLV': [ // Health Care Select Sector SPDR Fund
    { ticker: 'LLY', name: 'Eli Lilly and Company', weight: 11.2 },
    { ticker: 'UNH', name: 'UnitedHealth Group Inc.', weight: 9.8 },
    { ticker: 'JNJ', name: 'Johnson & Johnson', weight: 7.5 },
    { ticker: 'ABBV', name: 'AbbVie Inc.', weight: 5.9 },
    { ticker: 'MRK', name: 'Merck & Co. Inc.', weight: 5.2 },
    { ticker: 'TMO', name: 'Thermo Fisher Scientific Inc.', weight: 4.1 },
    { ticker: 'ABT', name: 'Abbott Laboratories', weight: 3.8 },
    { ticker: 'DHR', name: 'Danaher Corporation', weight: 3.5 },
    { ticker: 'PFE', name: 'Pfizer Inc.', weight: 3.2 },
    { ticker: 'BMY', name: 'Bristol-Myers Squibb Company', weight: 2.9 },
  ],
  'ARKK': [ // ARK Innovation ETF
    { ticker: 'COIN', name: 'Coinbase Global Inc.', weight: 9.8 },
    { ticker: 'ROKU', name: 'Roku Inc.', weight: 8.5 },
    { ticker: 'RBLX', name: 'Roblox Corporation', weight: 7.2 },
    { ticker: 'SHOP', name: 'Shopify Inc.', weight: 6.9 },
    { ticker: 'PATH', name: 'UiPath Inc.', weight: 5.8 },
    { ticker: 'CRSP', name: 'CRISPR Therapeutics AG', weight: 5.2 },
    { ticker: 'TDOC', name: 'Teladoc Health Inc.', weight: 4.9 },
    { ticker: 'TWLO', name: 'Twilio Inc.', weight: 4.5 },
    { ticker: 'DKNG', name: 'DraftKings Inc.', weight: 4.1 },
    { ticker: 'SQ', name: 'Block Inc.', weight: 3.8 },
  ],
};

async function seedETFHoldings() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  console.log('='.repeat(60));
  console.log('Seeding ETF Holdings Data');
  console.log('='.repeat(60));
  console.log('');

  let totalHoldings = 0;

  for (const [etfTicker, holdings] of Object.entries(ETF_HOLDINGS_DATA)) {
    console.log(`[${etfTicker}] Seeding ${holdings.length} holdings...`);

    try {
      // Delete existing holdings for this ETF
      await db.delete(etfHoldings).where(eq(etfHoldings.etfTicker, etfTicker));

      // Insert new holdings
      for (const holding of holdings) {
        await db.insert(etfHoldings).values({
          etfTicker,
          stockTicker: holding.ticker,
          weight: Math.round(holding.weight * 100), // store as integer (720 = 7.2%)
          shares: null,
          marketValue: null,
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

      console.log(`[${etfTicker}] ✓ Seeded ${holdings.length} holdings`);
      totalHoldings += holdings.length;

    } catch (error) {
      console.error(`[${etfTicker}] ✗ Error:`, error);
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Seeding Summary:');
  console.log(`  Total ETFs: ${Object.keys(ETF_HOLDINGS_DATA).length}`);
  console.log(`  Total Holdings: ${totalHoldings}`);
  console.log('='.repeat(60));
}

// Run the script
seedETFHoldings().catch(console.error);
