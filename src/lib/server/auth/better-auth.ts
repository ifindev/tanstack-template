import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/server/db/prisma";
import { env } from "@/lib/server/env";
import { sendEmail } from "@/lib/server/mail/transport";

export const auth = betterAuth({
  baseURL: env.betterAuthUrl,
  trustedOrigins: env.trustedOrigins,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.betterAuthSecret,
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
