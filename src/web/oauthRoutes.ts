import type { FastifyInstance } from "fastify";
import { z } from "zod";

const oauthCallbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1)
});

export const registerOauthRoutes = (app: FastifyInstance): void => {
  app.get("/oauth/google/callback", (request, reply) => {
    const params = oauthCallbackSchema.parse(request.query);
    return reply.send({
      ok: true,
      message: "OAuth callback received.",
      codeLength: params.code.length,
      state: params.state
    });
  });
};
