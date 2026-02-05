import type { Interaction, InteractionResponse } from "./discord/types";
import type { Log } from "./logger";

import { enotheia } from "./commands/enotheia";

export type Ctx = Readonly<{ log: Log }>;

export type Cmd = Readonly<{
  name: string;
  handle: (i: Interaction, ctx: Ctx) => Promise<InteractionResponse>;
}>;

export const registry = (): readonly Cmd[] => [enotheia];
export const route = (cmds: readonly Cmd[], i: Interaction): Cmd | undefined =>
  i.data?.name ? cmds.find((c) => c.name === i.data!.name) : undefined;
