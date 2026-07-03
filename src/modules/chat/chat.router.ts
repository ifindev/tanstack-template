import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "@/lib/server/trpc/init";
import {
  bulkDeleteConversationsSchema,
  deleteConversationSchema,
  getConversationSchema,
  listConversationsSchema,
  renameConversationSchema,
} from "./chat.schema";
import {
  deleteConversation,
  deleteConversations,
  getConversationWithMessages,
  listConversations,
  renameConversation,
} from "./chat.service";

export const chatRouter = router({
  listConversations: protectedProcedure
    .input(listConversationsSchema)
    .query(async ({ ctx, input }) => {
      const items = await listConversations(ctx.user.id, input);
      const hasMore = items.length > input.limit;
      const data = hasMore ? items.slice(0, -1) : items;
      return {
        items: data,
        nextCursor: hasMore ? data[data.length - 1]?.id : undefined,
      };
    }),

  getConversation: protectedProcedure
    .input(getConversationSchema)
    .query(async ({ ctx, input }) => {
      const conversation = await getConversationWithMessages(
        ctx.user.id,
        input.id,
      );
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }
      return conversation;
    }),

  renameConversation: protectedProcedure
    .input(renameConversationSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await renameConversation(
        ctx.user.id,
        input.id,
        input.title,
      );
      if (result.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }
      return { success: true };
    }),

  deleteConversation: protectedProcedure
    .input(deleteConversationSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await deleteConversation(ctx.user.id, input.id);
      if (result.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }
      return { success: true };
    }),

  deleteConversations: protectedProcedure
    .input(bulkDeleteConversationsSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await deleteConversations(ctx.user.id, input.ids);
      if (result.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No conversations found",
        });
      }
      return { success: true };
    }),
});
