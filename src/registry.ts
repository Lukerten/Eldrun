import type { Interaction } from "./discord/types";
import type { Route } from "./types/routing";

import { enotheiaCommand, enotheiaModal } from "./commands/enotheia";
import { itemCommand, itemModal } from "./commands/item";
import { questCommand, questModal } from "./commands/quest";

import {
  questEndCommand,
  questEndComponent,
  questEndModalCancelled,
  questEndModalSuccess,
  questEndModalTimeout,
} from "./commands/quest-end";

import {
  beastiaryCommand,
  beastiaryComponent,
  beastiaryModalFull,
  beastiaryModalMedium,
  beastiaryModalSmall,
} from "./commands/beastiary";

export const registry = (): readonly Route[] => [
  enotheiaCommand,
  enotheiaModal,
  itemCommand,
  itemModal,
  questCommand,
  questModal,
  questEndCommand,
  questEndComponent,
  questEndModalCancelled,
  questEndModalSuccess,
  questEndModalTimeout,
  beastiaryCommand,
  beastiaryComponent,
  beastiaryModalSmall,
  beastiaryModalMedium,
  beastiaryModalFull,
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

  if (i.type === 3) {
    const id = (i.data as any)?.custom_id;
    return typeof id === "string"
      ? routes.find((r) => r.kind === "component" && r.key === id)
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
