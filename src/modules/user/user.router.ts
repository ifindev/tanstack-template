import { protectedProcedure, router } from "@/lib/server/trpc/init";
import { updateProfileSchema } from "./user.schema";
import { getUserById, updateUser } from "./user.service";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return getUserById(ctx.user.id);
  }),

  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      return updateUser(ctx.user.id, input);
    }),
});
