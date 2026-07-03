import nodemailer from "nodemailer";
import { env } from "@/lib/server/env";

export const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: false,
  auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    html,
  });
}
