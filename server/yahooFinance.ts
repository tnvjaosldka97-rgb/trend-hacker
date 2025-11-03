import { callDataApi } from "./_core/dataApi";

export interface StockQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
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

    const responseData = response as any;
    if (responseData && responseData.chart && responseData.chart.result && responseData.chart.result[0]) {
      const result = responseData.chart.result[0];
      const meta = result.meta;

      return {
        symbol: meta.symbol,
        regularMarketPrice: meta.regularMarketPrice || 0,
        regularMarketChange: meta.regularMarketChange || 0,
        regularMarketChangePercent: meta.regularMarketChangePercent || 0,
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
