import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getOrCreateProfile,
  updateProfile,
  getProfilesByGender,
  createMatch,
  getMatches,
  updateMatchStatus,
  sendMessage,
  getMessages,
  markMessagesAsRead,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getOrCreateProfile(ctx.user.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          bio: z.string().optional(),
          age: z.number().optional(),
          gender: z.enum(["male", "female", "other"]).optional(),
          lookingFor: z.enum(["male", "female", "both"]).optional(),
          location: z.string().optional(),
          photoUrl: z.string().optional(),
          interests: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateProfile(ctx.user.id, input);
        return await getOrCreateProfile(ctx.user.id);
      }),
  }),

  discover: router({
    browse: protectedProcedure
      .input(
        z.object({
          lookingFor: z.enum(["male", "female", "both"]),
          limit: z.number().optional().default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        return await getProfilesByGender(ctx.user.id, input.lookingFor, input.limit);
      }),

    like: protectedProcedure
      .input(z.object({ targetUserId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await createMatch(ctx.user.id, input.targetUserId);
        return { success: true };
      }),
  }),

  matches: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getMatches(ctx.user.id);
    }),

    updateStatus: protectedProcedure
      .input(z.object({ matchId: z.number(), status: z.enum(["liked", "matched", "blocked"]) }))
      .mutation(async ({ ctx, input }) => {
        await updateMatchStatus(input.matchId, input.status);
        return { success: true };
      }),
  }),

  messages: router({
    send: protectedProcedure
      .input(z.object({ matchId: z.number(), receiverId: z.number(), content: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await sendMessage(input.matchId, ctx.user.id, input.receiverId, input.content);
        return { success: true };
      }),

    getConversation: protectedProcedure
      .input(z.object({ matchId: z.number(), limit: z.number().optional().default(50) }))
      .query(async ({ ctx, input }) => {
        await markMessagesAsRead(input.matchId, ctx.user.id);
        return await getMessages(input.matchId, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
