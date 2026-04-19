import type { FastifyInstance } from "fastify";
import { registerOauthRoutes } from "./oauthRoutes.js";

export const registerRoutes = (app: FastifyInstance): void => {
  app.get("/health", () => ({ ok: true }));
  app.get("/privacy", () => ({
    message:
      "このアプリはセルフモニタリング支援ツールであり、医療機器、診断システム、緊急対応システムではありません。"
  }));

  registerOauthRoutes(app);
};
