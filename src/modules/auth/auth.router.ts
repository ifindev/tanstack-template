import { TRPCError } from "@trpc/server";
import { authRateLimitedProcedure, router } from "@/lib/server/trpc/init";
import { AUTH_ERROR } from "./auth.constant";
import { registerSchema, resendVerificationSchema } from "./auth.schema";
import { registerUser, resendVerificationEmail } from "./auth.service";

export const authRouter = router({
  register: authRateLimitedProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      try {
        await registerUser(input);
        return { success: true };
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: AUTH_ERROR.REGISTRATION_FAILED,
        });
      }
    }),

  resendVerification: authRateLimitedProcedure
    .input(resendVerificationSchema)
    .mutation(async ({ input }) => {
      try {
        await resendVerificationEmail(input);
        return { success: true };
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: AUTH_ERROR.SEND_VERIFICATION_FAILED,
        });
      }
    }),
});
