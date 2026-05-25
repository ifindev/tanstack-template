import { authRouter } from "@/modules/auth/router";
import { chatRouter } from "@/modules/chat/router";
import { configRouter } from "@/modules/config/router";
import { userRouter } from "@/modules/user/router";
import { router } from "./init";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  chat: chatRouter,
  config: configRouter,
});

export type AppRouter = typeof appRouter;
