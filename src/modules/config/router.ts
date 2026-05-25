import { isChatEnabled } from "@/shared/ai/config";
import { publicProcedure, router } from "@/shared/trpc/init";

export const configRouter = router({
  features: publicProcedure.query(() => ({
    chatEnabled: isChatEnabled(),
  })),
});
