/**
 * Registers slash commands with Discord.
 *
 * Usage:
 *   pnpm register
 *
 * Environment variables required:
 *   DISCORD_APPLICATION_ID
 *   DISCORD_BOT_TOKEN
 */

import "dotenv/config";

const APP_ID = process.env.DISCORD_APPLICATION_ID!;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const GUILD_ID = process.env.GUILD_ID;

if (!APP_ID || !BOT_TOKEN) {
  throw new Error("Missing DISCORD_APPLICATION_ID or DISCORD_BOT_TOKEN");
}

/* -------------------------------------------------- */
/* Commands                                           */
/* -------------------------------------------------- */

const enotheia = {
  name: "enotheia",
  description: "Post a Lexika Enotheia entry",
  options: [
    {
      type: 3,
      name: "title",
      description: "Entry title",
      required: true,
      max_length: 100,
    },
    {
      type: 3,
      name: "text",
      description: "Markdown content",
      required: true,
      max_length: 1800,
    },
  ],
};

/* -------------------------------------------------- */

const commands = [enotheia];

const url = GUILD_ID
  ? `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`
  : `https://discord.com/api/v10/applications/${APP_ID}/commands`;

const main = async () => {
  console.log(
    GUILD_ID
      ? `Registering guild commands to ${GUILD_ID}...`
      : "Registering global commands...",
  );

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${res.status} ${res.statusText}\n${txt}`);
  }

  console.log("✅ Commands registered successfully");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
