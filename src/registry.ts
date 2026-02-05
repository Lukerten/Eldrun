import type { Interaction, InteractionResponse } from "./discord/types";
import { thorrim } from "./commands/thorrim";
import type { Log } from "./logger";

export type Ctx = Readonly<{ log: Log }>;

export type Cmd = Readonly<{
  name: string;
  handle: (i: Interaction, ctx: Ctx) => Promise<InteractionResponse>;
}>;

export const registry = (): readonly Cmd[] => [thorrim];

export const route = (cmds: readonly Cmd[], i: Interaction): Cmd | undefined =>
  i.data?.name ? cmds.find((c) => c.name === i.data!.name) : undefined;
