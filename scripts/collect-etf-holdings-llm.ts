#!/usr/bin/env tsx
/**
 * ETF Holdings Data Collection using LLM
 * 
 * This script uses LLM to generate ETF holdings data based on
 * publicly available information.
 * 
 * Usage:
 *   npx tsx scripts/collect-etf-holdings-llm.ts
 */

import { getDb } from '../server/db';
import { etfHoldings, stocks } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { invokeLLM } from '../server/_core/llm';

// Major ETFs to track
const ETF_LIST = [
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq-100)' },
  { ticker: 'VOO', name: 'Vanguard S&P 500 ETF' },
  { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF' },
  { ticker: 'IWM', name: 'iShares Russell 2000 ETF' },
  { ticker: 'XLK', name: 'Technology Select Sector SPDR Fund' },
  { ticker: 'XLF', name: 'Financial Select Sector SPDR Fund' },
  { ticker: 'XLE', name: 'Energy Select Sector SPDR Fund' },
  { ticker: 'XLV', name: 'Health Care Select Sector SPDR Fund' },
  { ticker: 'ARKK', name: 'ARK Innovation ETF' },
];

interface Holding {
  ticker: string;
  name: string;
  weight: number;
}

/**
 * Fetch ETF holdings using LLM
 */
async function fetchETFHoldingsFromLLM(etfTicker: string, etfName: string): Promise<Holding[]> {
  try {
    console.log(`[${etfTicker}] Fetching holdings from LLM...`);
    
    const prompt = `You are a financial data expert. Provide the current top 20 holdings of ${etfName} (${etfTicker}).

Return ONLY a JSON array with this exact format:
[
  {"ticker": "AAPL", "name": "Apple Inc.", "weight": 7.2},
  {"ticker": "MSFT", "name": "Microsoft Corporation", "weight": 6.8}
]

Requirements:
- Include ticker symbol, full company name, and weight percentage (as decimal, e.g., 7.2 for 7.2%)
- List top 20 holdings in descending order by weight
- Use actual current holdings data based on the latest available information
- Return ONLY the JSON array, no additional text or explanation`;

    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are a financial data expert. Always return valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'etf_holdings',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              holdings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    ticker: { type: 'string' },
                    name: { type: 'string' },
                    weight: { type: 'number' }
                  },
                  required: ['ticker', 'name', 'weight'],
                  additionalProperties: false
                }
              }
            },
            required: ['holdings'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error(`[${etfTicker}] No response from LLM`);
      return [];
    }

    const data = JSON.parse(content);
    const holdings: Holding[] = data.holdings || [];

    console.log(`[${etfTicker}] Found ${holdings.length} holdings from LLM`);
    return holdings;

  } catch (error) {
    console.error(`[${etfTicker}] Error fetching from LLM:`, error);
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
  console.log('ETF Holdings Data Collection (LLM-based)');
  console.log('='.repeat(60));
  console.log(`Collecting holdings for ${ETF_LIST.length} ETFs`);
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const etf of ETF_LIST) {
    try {
      const holdings = await fetchETFHoldingsFromLLM(etf.ticker, etf.name);
      
      if (holdings.length > 0) {
        await saveHoldings(etf.ticker, holdings);
        successCount++;
      } else {
        console.log(`[${etf.ticker}] No holdings found`);
        failCount++;
      }

      // Wait 2 seconds between requests
      console.log(`[${etf.ticker}] Waiting 2 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 2000));

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
