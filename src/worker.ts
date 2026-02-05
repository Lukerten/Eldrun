import type { Env } from "./env";
import { verifyDiscordRequest } from "./discord/verify";
import { pong, message } from "./discord/response";
import { registry, route } from "./registry";
import type { Interaction } from "./discord/types";

const methodNotAllowed = () =>
  new Response("Method Not Allowed", { status: 405 });
const notFound = () => new Response("Not Found", { status: 404 });
const unauthorized = () =>
  new Response("Bad request signature", { status: 401 });

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname !== "/") return notFound();
    if (req.method !== "POST") return methodNotAllowed();

    const verified = await verifyDiscordRequest(req, env.DISCORD_PUBLIC_KEY);
    if (!verified.ok) return unauthorized();

    const interaction = JSON.parse(verified.body) as Interaction;

    if (interaction.type === 1) return Response.json(pong());
    if (interaction.type !== 2) {
      return Response.json(message("Unsupported interaction.", true));
    }

    const cmd = route(registry(), interaction);
    if (!cmd) return Response.json(message("Unknown command.", true));

    try {
      return Response.json(await cmd.handle(interaction, { log: console }));
    } catch {
      return Response.json(message("Something went wrong.", true));
    }
  },
};
