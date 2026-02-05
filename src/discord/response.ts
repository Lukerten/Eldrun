import type { InteractionResponse } from "./types";

export const pong = (): InteractionResponse => ({ type: 1 }); // PONG

export const message = (
  content: string,
  ephemeral = false,
): InteractionResponse => ({
  type: 4,
  data: {
    content,
    flags: ephemeral ? 1 << 6 : undefined,
  },
});
