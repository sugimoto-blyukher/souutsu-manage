import pino from "pino";

export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  redact: {
    paths: [
      "*.accessToken",
      "*.refreshToken",
      "*.access_token",
      "*.refresh_token",
      "*.token",
      "*.authorization"
    ],
    censor: "[REDACTED]"
  }
});
