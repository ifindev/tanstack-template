import { authRouter } from "@/modules/auth/auth.router";
import { chatRouter } from "@/modules/chat/chat.router";
import { configRouter } from "@/modules/config/config.router";
import { userRouter } from "@/modules/user/user.router";
import { router } from "./init";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  chat: chatRouter,
  config: configRouter,
});

export type AppRouter = typeof appRouter;
