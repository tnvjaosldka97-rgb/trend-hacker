import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { getMultipleStockQuotes } from "./yahooFinance";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  influencers: router({
    list: publicProcedure.query(async () => {
      return await db.getAllInfluencers();
    }),
    
    byPlatform: publicProcedure
      .input(z.object({ platform: z.enum(["youtube", "twitter"]) }))
      .query(async ({ input }) => {
        return await db.getInfluencersByPlatform(input.platform);
      }),
    
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getInfluencerById(input.id);
      }),
    
    getStats: publicProcedure.query(async () => {
      const influencers = await db.getAllInfluencers();
      const contents = await db.getAllContents(1000);
      return {
        totalInfluencers: influencers.length,
        totalContents: contents.length,
      };
    }),
  }),

  contents: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional().default(50) }))
      .query(async ({ input }) => {
        return await db.getAllContents(input.limit);
      }),
    
    withInfluencer: publicProcedure
      .input(z.object({ limit: z.number().optional().default(50) }))
      .query(async ({ input }) => {
        return await db.getContentsWithInfluencer(input.limit);
      }),
    
    byInfluencer: publicProcedure
      .input(z.object({ 
        influencerId: z.number(),
        limit: z.number().optional().default(20)
      }))
      .query(async ({ input }) => {
        return await db.getContentsByInfluencer(input.influencerId, input.limit);
      }),
    
    byPlatform: publicProcedure
      .input(z.object({ 
        platform: z.enum(["youtube", "twitter"]),
        limit: z.number().optional().default(50)
      }))
      .query(async ({ input }) => {
        return await db.getContentsByPlatform(input.platform, input.limit);
      }),
    
    search: publicProcedure
      .input(z.object({ 
        keyword: z.string(),
        limit: z.number().optional().default(50)
      }))
      .query(async ({ input }) => {
        return await db.searchContents(input.keyword, input.limit);
      }),
    
    getLatest: publicProcedure
      .input(z.object({ limit: z.number().optional().default(6) }))
      .query(async ({ input }) => {
        const contents = await db.getAllContents(input.limit);
        // Parse JSON fields safely
        return contents.map(content => {
          let aiStocks = [];
          let aiKeyPoints = [];
          
          // Safe JSON parsing for aiStocks
          if (content.aiStocks) {
            try {
              if (typeof content.aiStocks === 'string') {
                aiStocks = JSON.parse(content.aiStocks);
              } else if (Array.isArray(content.aiStocks)) {
                aiStocks = content.aiStocks;
              }
            } catch (e) {
              console.warn(`Failed to parse aiStocks for content ${content.id}:`, e);
            }
          }
          
          // Safe JSON parsing for aiKeyPoints
          if (content.aiKeyPoints) {
            try {
              if (typeof content.aiKeyPoints === 'string') {
                aiKeyPoints = JSON.parse(content.aiKeyPoints);
              } else if (Array.isArray(content.aiKeyPoints)) {
                aiKeyPoints = content.aiKeyPoints;
              }
            } catch (e) {
              console.warn(`Failed to parse aiKeyPoints for content ${content.id}:`, e);
            }
          }
          
          return {
            ...content,
            aiStocks,
            aiKeyPoints,
          };
        });
      }),
    
    getTrendingStocks: publicProcedure.query(async () => {
      const contents = await db.getAllContents(100);
      const stockMentions: Record<string, { ticker: string; name: string; count: number }> = {};
      
      // 주요 종목 티커 패턴
      const stockPatterns = [
        { ticker: 'TSLA', name: 'Tesla', regex: /tesla|tsla/gi },
        { ticker: 'NVDA', name: 'NVIDIA', regex: /nvidia|nvda/gi },
        { ticker: 'AAPL', name: 'Apple', regex: /apple|aapl/gi },
        { ticker: 'MSFT', name: 'Microsoft', regex: /microsoft|msft/gi },
        { ticker: 'GOOGL', name: 'Google', regex: /google|googl|alphabet/gi },
        { ticker: 'AMZN', name: 'Amazon', regex: /amazon|amzn/gi },
        { ticker: 'META', name: 'Meta', regex: /meta|facebook/gi },
        { ticker: 'AMD', name: 'AMD', regex: /amd/gi },
        { ticker: 'DIS', name: 'Disney', regex: /disney|dis(?![a-z])/gi },
        { ticker: 'NFLX', name: 'Netflix', regex: /netflix|nflx/gi },
        { ticker: 'COIN', name: 'Coinbase', regex: /coinbase|coin/gi },
        { ticker: 'PLTR', name: 'Palantir', regex: /palantir|pltr/gi },
        { ticker: 'RBLX', name: 'Roblox', regex: /roblox|rblx/gi },
      ];
      
      contents.forEach(content => {
        const text = `${content.title || ''} ${content.description || ''}`.toLowerCase();
        stockPatterns.forEach(({ ticker, name, regex }) => {
          if (regex.test(text)) {
            if (!stockMentions[ticker]) {
              stockMentions[ticker] = { ticker, name, count: 0 };
            }
            stockMentions[ticker].count++;
          }
        });
      });
      
      return Object.values(stockMentions)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }),
    
    getHotKeywords: publicProcedure.query(async () => {
      const contents = await db.getAllContents(100);
      const keywordCounts: Record<string, number> = {};
      
      const keywords = ['AI', 'Fed', 'Tesla', 'NVIDIA', 'dividend', 'recession', 'Federal Reserve', 'crypto', 'earnings', 'inflation'];
      
      contents.forEach(content => {
        const text = `${content.title || ''} ${content.description || ''}`.toLowerCase();
        keywords.forEach(keyword => {
          if (text.includes(keyword.toLowerCase())) {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
          }
        });
      });
      
      return Object.entries(keywordCounts)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }),
  }),

  stocks: router({
    getQuotes: publicProcedure
      .input(z.object({ symbols: z.array(z.string()) }))
      .query(async ({ input }) => {
        return await getMultipleStockQuotes(input.symbols);
      }),
    
    getTopStocks: publicProcedure
      .input(z.object({ 
        timeWindow: z.enum(['15min', '24h', '7d']),
        limit: z.number().optional().default(10)
      }))
      .query(async ({ input }) => {
        return await db.getTopStocks(input.timeWindow, input.limit);
      }),
  }),

  experts: router({
    getTopExperts: publicProcedure
      .input(z.object({ limit: z.number().optional().default(50) }))
      .query(async ({ input }) => {
        return await db.getTopExperts(input.limit);
      }),
    
    getExpertAccuracy: publicProcedure
      .input(z.object({ influencerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getExpertAccuracy(input.influencerId);
      }),
    
    getPredictions: publicProcedure
      .input(z.object({ 
        influencerId: z.number(),
        limit: z.number().optional().default(50)
      }))
      .query(async ({ input }) => {
        return await db.getPredictionsByInfluencer(input.influencerId, input.limit);
      }),
  }),

  trending: router({
    realtime: publicProcedure.query(async () => {
      // Get last update time from DB
      const lastUpdateMeta = await db.getSystemMetadata('lastDataCollection');
      const lastUpdate = lastUpdateMeta ? new Date(lastUpdateMeta.value!) : null;
      const nextUpdate = lastUpdate ? new Date(lastUpdate.getTime() + 5 * 60 * 1000) : null;
      
      const contents = await db.getAllContents(100);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const recentTweets = contents.filter(c => 
        new Date(c.publishedAt) >= fiveMinutesAgo && c.aiStocks
      );

      const stockMap = new Map();
      for (const tweet of recentTweets) {
        try {
          const stocks = typeof tweet.aiStocks === 'string' ? JSON.parse(tweet.aiStocks) : tweet.aiStocks;
          const sentiment = tweet.aiSentiment || 'neutral';

          for (const ticker of stocks) {
            if (!stockMap.has(ticker)) {
              stockMap.set(ticker, { 
                ticker, 
                count: 0, 
                bullish: 0, 
                bearish: 0, 
                neutral: 0, 
                latestTweet: '',
                latestTweetUrl: '',
                latestTweetAuthor: '',
                latestTweetTime: null
              });
            }
            const stock = stockMap.get(ticker);
            stock.count++;
            if (sentiment === 'bullish') stock.bullish++;
            else if (sentiment === 'bearish') stock.bearish++;
            else stock.neutral++;
            if (!stock.latestTweet && tweet.aiSummary) {
              stock.latestTweet = tweet.aiSummary;
              stock.latestTweetUrl = tweet.url;
              stock.latestTweetAuthor = tweet.title?.match(/@(\w+):/)?.[1] || '';
              stock.latestTweetTime = tweet.publishedAt;
            }
          }
        } catch (e) {}
      }

      const stocks = Array.from(stockMap.values()).sort((a, b) => b.count - a.count).slice(0, 20);
      return { stocks, lastUpdate, nextUpdate, totalTweets: recentTweets.length };
    }),

    today: publicProcedure.query(async () => {
      const contents = await db.getAllContents(500);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const todayTweets = contents.filter(c => 
        new Date(c.publishedAt) >= oneDayAgo && c.aiStocks
      );

      const stockMap = new Map();
      const hourlyMap = new Map();

      for (const tweet of todayTweets) {
        try {
          const stocks = typeof tweet.aiStocks === 'string' ? JSON.parse(tweet.aiStocks) : tweet.aiStocks;
          const sentiment = tweet.aiSentiment || 'neutral';
          const hour = new Date(tweet.publishedAt).getHours();
          hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);

          for (const ticker of stocks) {
            if (!stockMap.has(ticker)) {
              stockMap.set(ticker, { 
                ticker, 
                count: 0, 
                bullish: 0, 
                bearish: 0, 
                neutral: 0, 
                sentiment: 'neutral', 
                latestTweet: '',
                latestTweetUrl: '',
                latestTweetAuthor: '',
                latestTweetTime: null
              });
            }
            const stock = stockMap.get(ticker);
            stock.count++;
            if (sentiment === 'bullish') stock.bullish++;
            else if (sentiment === 'bearish') stock.bearish++;
            else stock.neutral++;
            if (!stock.latestTweet && tweet.aiSummary) {
              stock.latestTweet = tweet.aiSummary;
              stock.latestTweetUrl = tweet.url;
              stock.latestTweetAuthor = tweet.title?.match(/@(\w+):/)?.[1] || '';
              stock.latestTweetTime = tweet.publishedAt;
            }
          }
        } catch (e) {}
      }

      for (const stock of Array.from(stockMap.values())) {
        if (stock.bullish > stock.bearish && stock.bullish > stock.neutral) stock.sentiment = 'bullish';
        else if (stock.bearish > stock.bullish && stock.bearish > stock.neutral) stock.sentiment = 'bearish';
        else stock.sentiment = 'neutral';
      }

      const stocks = Array.from(stockMap.values()).sort((a, b) => b.count - a.count);
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: hourlyMap.get(i) || 0 }));
      return { stocks, hourlyData, totalTweets: todayTweets.length };
    }),

    weekly: publicProcedure.query(async () => {
      const contents = await db.getAllContents(1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const weeklyTweets = contents.filter(c => 
        new Date(c.publishedAt) >= sevenDaysAgo && c.aiStocks
      );

      const stockMap = new Map();
      const dailyMap = new Map();

      for (const tweet of weeklyTweets) {
        try {
          const stocks = typeof tweet.aiStocks === 'string' ? JSON.parse(tweet.aiStocks) : tweet.aiStocks;
          const sentiment = tweet.aiSentiment || 'neutral';
          const date = new Date(tweet.publishedAt).toISOString().split('T')[0];
          dailyMap.set(date, (dailyMap.get(date) || 0) + 1);

          for (const ticker of stocks) {
            if (!stockMap.has(ticker)) {
              stockMap.set(ticker, { ticker, count: 0, bullish: 0, bearish: 0, neutral: 0, sentiment: 'neutral', avgPerDay: 0 });
            }
            const stock = stockMap.get(ticker);
            stock.count++;
            if (sentiment === 'bullish') stock.bullish++;
            else if (sentiment === 'bearish') stock.bearish++;
            else stock.neutral++;
          }
        } catch (e) {}
      }

      for (const stock of Array.from(stockMap.values())) {
        if (stock.bullish > stock.bearish && stock.bullish > stock.neutral) stock.sentiment = 'bullish';
        else if (stock.bearish > stock.bullish && stock.bearish > stock.neutral) stock.sentiment = 'bearish';
        else stock.sentiment = 'neutral';
        stock.avgPerDay = Math.round(stock.count / 7);
      }

      const stocks = Array.from(stockMap.values()).sort((a, b) => b.count - a.count);
      const dailyData = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
      return { stocks, dailyData, totalTweets: weeklyTweets.length };
    }),
  }),
});

export type AppRouter = typeof appRouter;
