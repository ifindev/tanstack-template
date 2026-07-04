import { z } from "zod";
import { INVALID_EMAIL } from "./auth.constant";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(INVALID_EMAIL),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(INVALID_EMAIL),
  password: z.string().min(1, "Password is required"),
});

export const resendVerificationSchema = z.object({
  email: z.string().email(INVALID_EMAIL),
});
