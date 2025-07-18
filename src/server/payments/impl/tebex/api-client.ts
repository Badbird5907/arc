import { env } from "@/env";
import { TebexClient } from "@badbird5907/mc-utils";

export const tebexClient = (env.TEBEX_PROJECT_ID && env.TEBEX_PRIVATE_KEY) ? new TebexClient({
  auth: {
    projectId: env.TEBEX_PROJECT_ID,
    privateKey: env.TEBEX_PRIVATE_KEY,
  }
}) : null;
