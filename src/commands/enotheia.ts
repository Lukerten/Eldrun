import type { Interaction, InteractionResponse } from "../discord/types";
import type { Route } from "../types/routing";
import { defineCommand } from "../utils/register";
import { makeEmbed, interactionEmbeds } from "../utils/embeds";

const CMD = "enotheia";
const MODAL_ID = "enotheia.modal.v1";

export const register = defineCommand({
  name: CMD,
  description: "Create an Enotheia entry (modal).",
});

const getModalValue = (
  i: Interaction,
  customId: string,
): string | undefined => {
  // Discord modal submit shape: data.components[].components[] with { custom_id, value }
  const components = (i as any)?.data?.components;
  if (!Array.isArray(components)) return undefined;

  for (const row of components) {
    const inner = row?.components;
    if (!Array.isArray(inner)) continue;

    for (const c of inner) {
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
    title: "Enotheia",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "title",
            label: "Title",
            style: 1,
            required: true,
            max_length: 256,
            placeholder: "Titel des Artikels",
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "text",
            label: "Text",
            style: 2,
            required: true,
            max_length: 4000,
            placeholder: "> ...",
          },
        ],
      },
    ],
  },
});

const handleModalSubmit = (i: Interaction): InteractionResponse => {
  const title = "Lexika Enotheia • " + getModalValue(i, "title")?.trim();
  const text = getModalValue(i, "text") ?? "";

  if (!title) {
    return {
      type: 4,
      data: { content: "Missing title.", flags: 64 },
    };
  }

  const embed = makeEmbed({
    color: 0x3498db,
    icon: "📘",
    title,
    text,
  });

  return interactionEmbeds([embed], false);
};

export const enotheiaCommand: Route = {
  kind: "command",
  key: CMD,
  handle: async () => openModal(),
};

export const enotheiaModal: Route = {
  kind: "modal",
  key: MODAL_ID,
  handle: async (i) => handleModalSubmit(i),
};
