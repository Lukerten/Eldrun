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
    flags: 64,
    components: [
      {
        type: 1,
        components: [
          {
            type: 3,
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

const modalSmall = (): InteractionResponse => ({
  type: 9,
  data: {
    custom_id: `${MODAL_PREFIX}small`,
    title: "Beastiary • small",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "stats",
            label: "Info block",
            style: 2,
            required: true,
            max_length: 4000,
          },
        ],
      },
    ],
  },
});

const modalMedium = (): InteractionResponse => ({
  type: 9,
  data: {
    custom_id: `${MODAL_PREFIX}medium`,
    title: "Beastiary • medium",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "stats",
            label: "Info block",
            style: 2,
            required: true,
            max_length: 4000,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "traits",
            label: "Traits block",
            style: 2,
            required: true,
            max_length: 4000,
          },
        ],
      },
    ],
  },
});

const modalFull = (): InteractionResponse => ({
  type: 9,
  data: {
    custom_id: `${MODAL_PREFIX}full`,
    title: "Beastiary • full",
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "stats",
            label: "Info block",
            style: 2,
            required: true,
            max_length: 4000,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "traits",
            label: "Traits block",
            style: 2,
            required: true,
            max_length: 4000,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "attacks",
            label: "Attacks",
            style: 2,
            required: true,
            max_length: 4000,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "spells",
            label: "Spells",
            style: 2,
            required: false,
            max_length: 4000,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "passives",
            label: "Passives / Status / Trigger",
            style: 2,
            required: false,
            max_length: 4000,
          },
        ],
      },
    ],
  },
});

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
    if (v === "small") return modalSmall();
    if (v === "medium") return modalMedium();
    if (v === "full") return modalFull();

    return { type: 4, data: { content: "Invalid selection.", flags: 64 } };
  },
};
