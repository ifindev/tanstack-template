import { TRPCError } from "@trpc/server";
import { authRateLimitedProcedure, router } from "@/shared/trpc/init";
import { AUTH_ERROR } from "./constants";
import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
} from "./schema";
import { loginUser, registerUser, resendVerificationEmail } from "./service";

export const authRouter = router({
  register: authRateLimitedProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      try {
        await registerUser(input);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : AUTH_ERROR.REGISTRATION_FAILED,
        });
      }
    }),

  login: authRateLimitedProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await loginUser(input);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            error instanceof Error ? error.message : AUTH_ERROR.LOGIN_FAILED,
        });
      }
    }),

  resendVerification: authRateLimitedProcedure
    .input(resendVerificationSchema)
    .mutation(async ({ input }) => {
      try {
        await resendVerificationEmail(input);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : AUTH_ERROR.SEND_VERIFICATION_FAILED,
        });
      }
    }),
});
