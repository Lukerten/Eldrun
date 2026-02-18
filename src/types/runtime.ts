import type { Env } from "../env";
import type { Log } from "../logger";
import type { Interaction, InteractionResponse } from "../discord/types";

export type Ctx = Readonly<{
  log: Log;
  env: Env;
  waitUntil: (p: Promise<unknown>) => void;
}>;

export type Handler = (
  i: Interaction,
  ctx: Ctx,
) => Promise<InteractionResponse>;
