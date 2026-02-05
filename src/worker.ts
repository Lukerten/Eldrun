import type { Env } from "./env";
import { createLogger } from "./logger";
import { verifyDiscordRequest } from "./discord/verify";
import { pong, message } from "./discord/response";
import { registry, route } from "./registry";
import type { Interaction } from "./discord/types";

const METHOD_NOT_ALLOWED = new Response("Method Not Allowed", { status: 405 });
const NOT_FOUND = new Response("Not Found", { status: 404 });
const UNAUTHORIZED = new Response("Bad request signature", { status: 401 });

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const log = createLogger();

    const url = new URL(req.url);

    if (url.pathname !== "/") return NOT_FOUND;
    if (req.method !== "POST") return METHOD_NOT_ALLOWED;

    const verified = await verifyDiscordRequest(req, env.DISCORD_PUBLIC_KEY);
    if (!verified.ok) return UNAUTHORIZED;

    const interaction = JSON.parse(verified.body) as Interaction;

    if (interaction.type === 1) {
      log.info("ping");
      return Response.json(pong());
    }

    if (interaction.type !== 2) {
      return Response.json(message("Unsupported interaction.", true));
    }

    const cmds = registry();
    const cmd = route(cmds, interaction);

    if (!cmd) {
      log.warn({ cmd: interaction.data?.name }, "unknown command");
      return Response.json(message("Unknown command.", true));
    }

    try {
      const res = await cmd.handle(interaction, { log });
      return Response.json(res);
    } catch (err) {
      log.error({ err }, "command crashed");
      return Response.json(message("Something went wrong.", true));
    }
  },
};
