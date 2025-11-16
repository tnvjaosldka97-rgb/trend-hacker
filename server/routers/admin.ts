import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getAllSubscriptionsWithUsers,
  updateSubscriptionByUserId,
} from "../db";

// Admin-only middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "관리자 권한이 필요합니다",
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  listSubscriptions: adminProcedure.query(async () => {
    return await getAllSubscriptionsWithUsers();
  }),

  updateSubscription: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        plan: z.enum(["free", "pro", "premium"]).optional(),
        status: z.enum(["active", "cancelled", "expired"]).optional(),
        expiresAt: z.date().optional(),
        onDemandUsed: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, ...updates } = input;
      await updateSubscriptionByUserId(userId, updates);
      return { success: true };
    }),
});
