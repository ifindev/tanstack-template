import { protectedProcedure, router } from "@/shared/trpc/init";
import {
  bulkDeleteConversationsSchema,
  deleteConversationSchema,
  getConversationSchema,
  listConversationsSchema,
  renameConversationSchema,
} from "./schema";
import {
  deleteConversation,
  deleteConversations,
  getConversationWithMessages,
  listConversations,
  renameConversation,
} from "./service";

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
      return getConversationWithMessages(ctx.user.id, input.id);
    }),

  renameConversation: protectedProcedure
    .input(renameConversationSchema)
    .mutation(async ({ ctx, input }) => {
      await renameConversation(ctx.user.id, input.id, input.title);
      return { success: true };
    }),

  deleteConversation: protectedProcedure
    .input(deleteConversationSchema)
    .mutation(async ({ ctx, input }) => {
      await deleteConversation(ctx.user.id, input.id);
      return { success: true };
    }),

  deleteConversations: protectedProcedure
    .input(bulkDeleteConversationsSchema)
    .mutation(async ({ ctx, input }) => {
      await deleteConversations(ctx.user.id, input.ids);
      return { success: true };
    }),
});
