import type { Interaction, InteractionResponse } from "../discord/types";
import type { Route } from "../types/routing";
import { defineCommand } from "../utils/register";
import { interactionEmbeds } from "../utils/embeds";
import { renderItemMessage } from "../utils/items";

const CMD = "quest";
const MODAL_ID = "quest.modal.v1";

const QUEST_COLOR = 0x3498db;

export const register = defineCommand({
  name: CMD,
  description: "Create a quest/event entry (modal).",
});

const getModalValue = (
  i: Interaction,
  customId: string,
): string | undefined => {
  const rows = (i as any)?.data?.components;
  if (!Array.isArray(rows)) return undefined;

  for (const row of rows) {
    const comps = row?.components;
    if (!Array.isArray(comps)) continue;

    for (const c of comps) {
      if (c?.custom_id === customId && typeof c?.value === "string") {
        return c.value;
      }
    }
  }

  return undefined;
};

const openModal = (): InteractionResponse => ({
  type: 9,
  data: {
    custom_id: MODAL_ID,
    title: "Quest / Event",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "event",
            label: "Event ([!info] block)",
            style: 2,
            required: true,
            max_length: 4000,
            placeholder:
              "> [!info] Event · Da simmer dabei\n> Im [[Gildenhaus von Velmora]] ...",
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "rest",
            label: "Rest (Sub-Events / Blocks)",
            style: 2,
            required: false,
            max_length: 4000,
            placeholder:
              "> [!quote] Sub-Event • ...\n> ...\n\n> [!quote] Sub-Event • ...\n> ...",
          },
        ],
      },
    ],
  },
});

const handleModalSubmit = (i: Interaction): InteractionResponse => {
  const eventRaw = getModalValue(i, "event") ?? "";
  const restRaw = getModalValue(i, "rest") ?? "";

  if (eventRaw.trim().length === 0) {
    return { type: 4, data: { content: "Missing event block.", flags: 64 } };
  }

  const text = renderItemMessage(eventRaw, restRaw);

  const embed =
    text.length > 0
      ? { color: QUEST_COLOR, description: text.slice(0, 4096) }
      : { color: QUEST_COLOR };

  return interactionEmbeds([embed], false);
};

export const questCommand: Route = {
  kind: "command",
  key: CMD,
  handle: async () => openModal(),
};

export const questModal: Route = {
  kind: "modal",
  key: MODAL_ID,
  handle: async (i) => handleModalSubmit(i),
};
