import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/shared/db/prisma";
import { sendEmail } from "@/shared/mail/transport";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: ["http://localhost:3000"],
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret:
    process.env.BETTER_AUTH_SECRET ?? "change-me-in-production-min-32-chars",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`,
      });
    },
  },
  session: {
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
});
