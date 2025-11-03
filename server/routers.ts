import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

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
        return await db.getAllContents(input.limit);
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
});

export type AppRouter = typeof appRouter;
