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
  }),
});

export type AppRouter = typeof appRouter;
