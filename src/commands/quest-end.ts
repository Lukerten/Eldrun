import type { Interaction, InteractionResponse } from "../discord/types";
import type { Route } from "../types/routing";
import { defineCommand } from "../utils/register";
import { interactionEmbeds } from "../utils/embeds";
import { parseCallout } from "../utils/callouts";

const CMD = "quest-end";

const SELECT_ID = "quest-end.select.v1";
const MODAL_PREFIX = "quest-end.modal.v1|";

type ResultType = "success" | "cancelled" | "time-out";

const RESULT_STYLE: Record<
  ResultType,
  { icon: string; color: number; label: string }
> = {
  success: { icon: "✅", color: 0x2ecc71, label: "Success" },
  cancelled: { icon: "❌", color: 0xe74c3c, label: "Cancelled" },
  "time-out": { icon: "⏳", color: 0xf39c12, label: "Time-out" },
};

export const register = defineCommand({
  name: CMD,
  description: "Close a quest/event with a result (select → modal).",
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

const getSelectedValue = (i: Interaction): string | undefined => {
  const values = (i as any)?.data?.values;
  if (!Array.isArray(values)) return undefined;
  const v = values[0];
  return typeof v === "string" ? v : undefined;
};

const openResultSelect = (): InteractionResponse => ({
  type: 4,
  data: {
    content: "Choose the quest end result:",
    flags: 64,
    components: [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: SELECT_ID,
            placeholder: "Select result…",
            min_values: 1,
            max_values: 1,
            options: (Object.keys(RESULT_STYLE) as ResultType[]).map((k) => ({
              label: RESULT_STYLE[k].label,
              value: k,
              emoji: { name: RESULT_STYLE[k].icon },
            })),
          },
        ],
      },
    ],
  },
});

const openModalForResult = (result: ResultType): InteractionResponse => ({
  type: 9,
  data: {
    custom_id: `${MODAL_PREFIX}${result}`,
    title: `Quest End • ${RESULT_STYLE[result].label}`,
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "title",
            label: "Quest title",
            style: 1,
            required: true,
            max_length: 256,
            placeholder: "Quest Title",
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "panel",
            label: "Result panel",
            style: 2,
            required: true,
            max_length: 4000,
            placeholder: "> [!success] Result...",
          },
        ],
      },
    ],
  },
});

const parseResultFromModalId = (customId: string): ResultType | undefined => {
  if (!customId.startsWith(MODAL_PREFIX)) return undefined;
  const tail = customId.slice(MODAL_PREFIX.length);
  return tail === "success" || tail === "cancelled" || tail === "time-out"
    ? (tail as ResultType)
    : undefined;
};

const handleModalSubmit = (i: Interaction): InteractionResponse => {
  const modalId = (i as any)?.data?.custom_id;
  if (typeof modalId !== "string") {
    return { type: 4, data: { content: "Invalid modal submit.", flags: 64 } };
  }

  const resultType = parseResultFromModalId(modalId);
  if (!resultType) {
    return { type: 4, data: { content: "Unknown result type.", flags: 64 } };
  }

  const title = "Quest • " + (getModalValue(i, "title") ?? "").trim();
  const panelRaw = getModalValue(i, "panel") ?? "";

  if (!title) {
    return { type: 4, data: { content: "Missing quest title.", flags: 64 } };
  }

  const style = RESULT_STYLE[resultType];

  // We accept the callout block but render only its body text with the result icon.
  const parsed = parseCallout(panelRaw);
  const body = parsed.text.trim();
  const description = body.length > 0 ? `${style.icon} ${body}` : style.icon;

  const embed = {
    color: style.color,
    title,
    description: description.slice(0, 4096),
  };

  return interactionEmbeds([embed], false);
};

export const questEndCommand: Route = {
  kind: "command",
  key: CMD,
  handle: async () => openResultSelect(),
};

export const questEndComponent: Route = {
  kind: "component",
  key: SELECT_ID,
  handle: async (i) => {
    const selected = getSelectedValue(i);
    if (
      selected !== "success" &&
      selected !== "cancelled" &&
      selected !== "time-out"
    ) {
      return { type: 4, data: { content: "Invalid selection.", flags: 64 } };
    }
    return openModalForResult(selected);
  },
};

export const questEndModalSuccess: Route = {
  kind: "modal",
  key: `${MODAL_PREFIX}success`,
  handle: async (i) => handleModalSubmit(i),
};

export const questEndModalCancelled: Route = {
  kind: "modal",
  key: `${MODAL_PREFIX}cancelled`,
  handle: async (i) => handleModalSubmit(i),
};

export const questEndModalTimeout: Route = {
  kind: "modal",
  key: `${MODAL_PREFIX}time-out`,
  handle: async (i) => handleModalSubmit(i),
};
