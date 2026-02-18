import type { Interaction, InteractionResponse } from "../discord/types";
import type { Route } from "../types/routing";
import { defineCommand } from "../utils/register";
import { interactionEmbeds } from "../utils/embeds";
import { renderItemMessage } from "../utils/items";

const CMD = "item";
const MODAL_ID = "item.modal.v1";

// Gelb
const ITEM_COLOR = 0xf1c40f;

export const register = defineCommand({
  name: CMD,
  description: "Create an item entry (modal).",
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
    title: "Item",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "item",
            label: "Item ([!info] block)",
            style: 2,
            required: true,
            max_length: 4000,
            placeholder: "> [!info] Item • ...",
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "rest",
            label: "Rest (effects/spells/blocks)",
            style: 2,
            required: false,
            max_length: 4000,
            placeholder: "> [!danger] Effect • ...",
          },
        ],
      },
    ],
  },
});

const handleModalSubmit = (i: Interaction): InteractionResponse => {
  const itemRaw = getModalValue(i, "item") ?? "";
  const restRaw = getModalValue(i, "rest") ?? "";

  if (itemRaw.trim().length === 0) {
    return {
      type: 4,
      data: { content: "Missing item block.", flags: 64 },
    };
  }

  const text = renderItemMessage(itemRaw, restRaw);

  const embed =
    text.length > 0
      ? { color: ITEM_COLOR, description: text.slice(0, 4096) }
      : { color: ITEM_COLOR };

  return interactionEmbeds([embed], false);
};

export const itemCommand: Route = {
  kind: "command",
  key: CMD,
  handle: async () => openModal(),
};

export const itemModal: Route = {
  kind: "modal",
  key: MODAL_ID,
  handle: async (i) => handleModalSubmit(i),
};
