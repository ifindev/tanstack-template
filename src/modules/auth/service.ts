import { auth } from "@/shared/auth/better-auth";
import { VERIFICATION_CALLBACK_URL } from "./constants";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  return auth.api.signUpEmail({
    body: data,
  });
}

export async function loginUser(data: { email: string; password: string }) {
  return auth.api.signInEmail({
    body: data,
  });
}

export async function resendVerificationEmail(data: { email: string }) {
  return auth.api.sendVerificationEmail({
    body: { email: data.email, callbackURL: VERIFICATION_CALLBACK_URL },
  });
}
