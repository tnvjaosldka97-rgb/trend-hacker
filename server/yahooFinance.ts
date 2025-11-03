import { callDataApi } from "./_core/dataApi";

export interface StockQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  marketCap?: number;
  volume?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
}

/**
 * Get stock quote data from Yahoo Finance
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await callDataApi("YahooFinance/get_stock_chart", {
      query: {
        symbol,
        region: "US",
        interval: "1d",
        range: "1d",
      },
    });

    // Ensure response is parsed as JSON
    let responseData: any;
    if (typeof response === 'string') {
      try {
        responseData = JSON.parse(response);
      } catch (e) {
        console.error(`Failed to parse response for ${symbol}:`, e);
        return null;
      }
    } else {
      responseData = response;
    }

    if (responseData && responseData.chart && responseData.chart.result && responseData.chart.result[0]) {
      const result = responseData.chart.result[0];
      const meta = result.meta;

      return {
        symbol: meta.symbol,
        regularMarketPrice: meta.regularMarketPrice || 0,
        regularMarketChange: meta.regularMarketChange || 0,
        regularMarketChangePercent: meta.regularMarketChangePercent || 0,
        marketCap: meta.marketCap,
        volume: meta.regularMarketVolume,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
        regularMarketOpen: meta.regularMarketOpen,
        regularMarketDayHigh: meta.regularMarketDayHigh,
        regularMarketDayLow: meta.regularMarketDayLow,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching stock quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get multiple stock quotes at once
 */
export async function getMultipleStockQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
  const quotes: Record<string, StockQuote> = {};

  await Promise.all(
    symbols.map(async (symbol) => {
      const quote = await getStockQuote(symbol);
      if (quote) {
        quotes[symbol] = quote;
      }
    })
  );

  return quotes;
}
