import Fastify from "fastify";
import { parseEnv } from "./config/env.js";
import { createDiscordClient } from "./bot/client.js";
import { registerRoutes } from "./web/routes.js";
import { logger } from "./utils/logger.js";

export const buildApp = () => {
  const env = parseEnv(process.env);
  const app = Fastify({
    logger: false
  });

  registerRoutes(app);

  const discordClient = createDiscordClient(env.DISCORD_TOKEN);
  return { app, env, discordClient };
};

const bootstrap = async (): Promise<void> => {
  const { app, env } = buildApp();
  const port = Number(new URL(env.APP_BASE_URL).port || 3000);
  await app.listen({ port, host: "0.0.0.0" });
  logger.info({ port }, "application started");
};

if (process.env.NODE_ENV !== "test") {
  void bootstrap().catch((error: unknown) => {
    logger.error({ error }, "failed to start application");
    process.exitCode = 1;
  });
}
