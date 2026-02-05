import "dotenv/config";

const APP_ID = process.env.DISCORD_APPLICATION_ID!;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const GUILD_ID = process.env.GUILD_ID;

const eldrun = {
  name: "Eldrun",
  description: "Fabula Ultima Utilities",
  options: [],
};

const url = GUILD_ID
  ? `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`
  : `https://discord.com/api/v10/applications/${APP_ID}/commands`;

const main = async () => {
  const r = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([eldrun]),
  });

  if (!r.ok) throw new Error(`${r.status} ${r.statusText}: ${await r.text()}`);
  console.log("registered");
};

main();
