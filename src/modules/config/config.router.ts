import { isChatEnabled } from "@/lib/server/ai/config";
import { publicProcedure, router } from "@/lib/server/trpc/init";

export const configRouter = router({
  features: publicProcedure.query(() => ({
    chatEnabled: isChatEnabled(),
  })),
});
