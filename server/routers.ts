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

    getByTicker: publicProcedure
      .input(z.object({ ticker: z.string() }))
      .query(async ({ input }) => {
        return await db.getStockByTicker(input.ticker);
      }),

    getAll: publicProcedure
      .input(z.object({ limit: z.number().optional().default(100) }))
      .query(async ({ input }) => {
        return await db.getAllStocks(input.limit);
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

  etf: router({
    getHoldings: publicProcedure
      .input(z.object({ etfTicker: z.string() }))
      .query(async ({ input }) => {
        return await db.getEtfHoldings(input.etfTicker);
      }),
  }),

  subscription: router({
    getCurrent: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        return { plan: 'free', expiresAt: null };
      }
      const subscription = await db.getUserSubscription(ctx.user.id);
      return subscription || { plan: 'free', expiresAt: null };
    }),

    subscribe: publicProcedure
      .input(z.object({ plan: z.enum(['pro', 'premium']) }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new Error('로그인이 필요합니다.');
        }
        
        // Calculate expiration date (30 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        await db.upsertSubscription({
          userId: ctx.user.id,
          plan: input.plan,
          status: 'active',
          expiresAt,
        });
        
        return { success: true };
      }),

    cancel: publicProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) {
        throw new Error('로그인이 필요합니다.');
      }
      
      await db.cancelSubscription(ctx.user.id);
      return { success: true };
    }),
  }),

  trending: router({
    realtime: publicProcedure.query(async () => {
      const { getRealtimeTrending } = await import('./trending');
      return await getRealtimeTrending();
    }),

    today: publicProcedure.query(async () => {
      const { getTodayTrending } = await import('./trending');
      return await getTodayTrending();
    }),

    weekly: publicProcedure.query(async () => {
      const { getWeeklyTrending } = await import('./trending');
      return await getWeeklyTrending();
    }),

    monthly: publicProcedure.query(async () => {
      const { getMonthlyTrending } = await import('./trending');
      return await getMonthlyTrending();
    }),

    getTweetsByTicker: publicProcedure
      .input(z.object({
        ticker: z.string(),
        timeRange: z.enum(['24h', '7d']).optional().default('24h'),
        limit: z.number().optional().default(50),
      }))
      .query(async ({ input }) => {
        return await db.getTweetsByTicker(input.ticker, input.timeRange, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
