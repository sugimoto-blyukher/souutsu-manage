import { Client, GatewayIntentBits } from "discord.js";

export const createDiscordClient = (token?: string): Client<boolean> | null => {
  if (!token) {
    return null;
  }

  const client = new Client({
    intents: [GatewayIntentBits.DirectMessages]
  });

  return client;
};
