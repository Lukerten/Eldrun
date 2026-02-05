import type { Env } from "./env";
import type { Log } from "./logger";
import type { Interaction, InteractionResponse } from "./discord/types";
import { enotheia } from "./commands/enotheia";

import {
  beastiarySmall,
  beastiarySmallModal,
} from "./commands/beastiary-small";

import {
  beastiaryMedium,
  beastiaryMediumModal,
} from "./commands/beastiary-medium";

import { beastiaryFull, beastiaryFullModal } from "./commands/beastiary-full";

export type Ctx = Readonly<{
  log: Log;
  env: Env;
  waitUntil: (p: Promise<unknown>) => void;
}>;

export type Cmd = Readonly<{
  name: string;
  handle: (i: Interaction, ctx: Ctx) => Promise<InteractionResponse>;
}>;

export type Handler = (
  i: Interaction,
  ctx: Ctx,
) => Promise<InteractionResponse>;

export type Route =
  | Readonly<{ kind: "command"; key: string; handle: Handler }>
  | Readonly<{ kind: "modal"; key: string; handle: Handler }>;

export const registry = (): readonly Route[] => [
  { kind: "command", key: "enotheia", handle: enotheia.handle },
  { kind: "command", key: "beastiary-small", handle: beastiarySmall.handle },
  { kind: "command", key: "beastiary-medium", handle: beastiaryMedium.handle },
  { kind: "command", key: "beastiary-full", handle: beastiaryFull.handle },
  {
    kind: "modal",
    key: "beastiary-small-modal",
    handle: beastiarySmallModal.handle,
  },
  {
    kind: "modal",
    key: "beastiary-medium-modal",
    handle: beastiaryMediumModal.handle,
  },
  {
    kind: "modal",
    key: "beastiary-full-modal",
    handle: beastiaryFullModal.handle,
  },
];

export const route = (
  routes: readonly Route[],
  i: Interaction,
): Route | undefined => {
  if (i.type === 2) {
    const name = (i.data as any)?.name;
    return typeof name === "string"
      ? routes.find((r) => r.kind === "command" && r.key === name)
      : undefined;
  }

  if (i.type === 5) {
    const id = (i.data as any)?.custom_id;
    return typeof id === "string"
      ? routes.find((r) => r.kind === "modal" && r.key === id)
      : undefined;
  }

  return undefined;
};
