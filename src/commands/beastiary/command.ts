import type { InteractionResponse } from "../../discord/types";
import type { Route } from "../../types/routing";
import { defineCommand } from "../../utils/register";

export const CMD = "beastiary";

export const SELECT_ID = "beastiary.select.v1";
export const MODAL_PREFIX = "beastiary.modal.v1|";

export type Mode = "small" | "medium" | "full";

export const register = defineCommand({
  name: CMD,
  description: "Create a bestiary entry (select → modal).",
});

const getSelectedValue = (i: any): string | undefined => {
  const values = i?.data?.values;
  if (!Array.isArray(values)) return undefined;
  const v = values[0];
  return typeof v === "string" ? v : undefined;
};

const openSelect = (): InteractionResponse => ({
  type: 4,
  data: {
    content: "Choose bestiary entry size:",
    flags: 64, // ephemeral
    components: [
      {
        type: 1, // ACTION_ROW
        components: [
          {
            type: 3, // STRING_SELECT
            custom_id: SELECT_ID,
            placeholder: "Select size…",
            min_values: 1,
            max_values: 1,
            options: [
              { label: "Small", value: "small", emoji: { name: "🟣" } },
              { label: "Medium", value: "medium", emoji: { name: "🟣" } },
              { label: "Full", value: "full", emoji: { name: "🟣" } },
            ],
          },
        ],
      },
    ],
  },
});

const modalFor = (mode: Mode): InteractionResponse => {
  const base: any[] = [
    {
      type: 1,
      components: [
        {
          type: 4,
          custom_id: "name",
          label: "Name",
          style: 1, // SHORT
          required: true,
          max_length: 256,
          placeholder: "Monster Name",
        },
      ],
    },
    {
      type: 1,
      components: [
        {
          type: 4,
          custom_id: "stats",
          label: "Block 1 (stats)",
          style: 2, // PARAGRAPH
          required: true,
          max_length: 4000,
          // <= 100 chars!
          placeholder: "> [!info] Lv ...",
        },
      ],
    },
  ];

  const withTraits: any[] = [
    ...base,
    {
      type: 1,
      components: [
        {
          type: 4,
          custom_id: "traits",
          label: "Block 2 (traits)",
          style: 2,
          required: true,
          max_length: 4000,
          placeholder: "> [!abstract] Traits...",
        },
      ],
    },
  ];

  const withFull: any[] = [
    ...withTraits,
    {
      type: 1,
      components: [
        {
          type: 4,
          custom_id: "full",
          label: "Block 3+ (moves)",
          style: 2,
          required: true,
          max_length: 4000,
          placeholder: "Anfriffe, Spells, und alles Andere",
        },
      ],
    },
  ];

  const components =
    mode === "small" ? base : mode === "medium" ? withTraits : withFull;

  return {
    type: 9,
    data: {
      custom_id: `${MODAL_PREFIX}${mode}`,
      title: `Beastiary • ${mode}`,
      components,
    },
  };
};

export const beastiaryCommand: Route = {
  kind: "command",
  key: CMD,
  handle: async () => openSelect(),
};

export const beastiaryComponent: Route = {
  kind: "component",
  key: SELECT_ID,
  handle: async (i) => {
    const v = getSelectedValue(i);
    if (v !== "small" && v !== "medium" && v !== "full") {
      return {
        type: 4,
        data: { content: "Invalid selection.", flags: 64 },
      };
    }
    return modalFor(v);
  },
};
