import { protectedProcedure, router } from "@/shared/trpc/init";
import { updateProfileSchema } from "./schema";
import { getUserById, updateUser } from "./service";

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
