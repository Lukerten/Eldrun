import "dotenv/config";

import { register as enotheia } from "../src/commands/enotheia";
import { register as item } from "../src/commands/item";
import { register as quest } from "../src/commands/quest";
import { defineCommands } from "../src/utils/register";

const APP_ID = process.env.DISCORD_APPLICATION_ID!;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const GUILD_ID = process.env.GUILD_ID;

if (!APP_ID || !BOT_TOKEN) {
  throw new Error("Missing DISCORD_APPLICATION_ID or DISCORD_BOT_TOKEN");
}

const commands = [
  ...defineCommands(enotheia),
  ...defineCommands(item),
  ...defineCommands(quest),
];

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
