import { auth } from "@/lib/server/auth/better-auth";
import { VERIFICATION_CALLBACK_URL } from "./auth.constant";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  return auth.api.signUpEmail({
    body: data,
  });
}

export async function resendVerificationEmail(data: { email: string }) {
  return auth.api.sendVerificationEmail({
    body: { email: data.email, callbackURL: VERIFICATION_CALLBACK_URL },
  });
}
