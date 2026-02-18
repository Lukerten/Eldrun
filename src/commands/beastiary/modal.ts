import type { Interaction, InteractionResponse } from "../../discord/types";
import type { Route } from "../../types/routing";
import { interactionEmbeds, makeEmbed } from "../../utils/embeds";
import { normalizeItemBlock } from "../../utils/items";
import { affinityBlockToList } from "../../utils/affinity";
import { parseCallout } from "../../utils/callouts";
import { MODAL_PREFIX } from "./command";

type Mode = "small" | "medium" | "full";

const VIOLET = 0x9b59b6;

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

const normalizeNewlines = (s: string) => s.replace(/\r\n/g, "\n").trim();

const stripQuotePrefixPerLine = (s: string) =>
  s
    .split("\n")
    .map((line) => line.replace(/^\s*>\s?/, ""))
    .join("\n");

const splitCalloutBlocks = (raw: string): readonly string[] => {
  const cleaned = normalizeNewlines(stripQuotePrefixPerLine(raw));
  if (!cleaned) return [];

  const lines = cleaned.split("\n");

  const blocks: string[] = [];
  let buf: string[] = [];

  const flush = () => {
    const b = buf.join("\n").trim();
    if (b) blocks.push(b);
    buf = [];
  };

  for (const line of lines) {
    const isHeader = /^\s*\[![^\]]+\]/.test(line.trim());
    if (isHeader && buf.length > 0) flush();
    buf.push(line);
  }

  flush();
  return blocks;
};

const renderFullBlocks = (raw: string): string => {
  const blocks = splitCalloutBlocks(raw);
  if (blocks.length === 0) return "";

  const rendered = blocks.map((b) => {
    const c = parseCallout(b);
    const header = c.title ? `${c.icon} **${c.title}**` : `${c.icon}`;
    const body = c.text.trim();
    return body ? `${header}\n${body}` : header;
  });

  return rendered.join("\n\n").trim();
};

const parseModeFromModalId = (customId: string): Mode | undefined => {
  if (!customId.startsWith(MODAL_PREFIX)) return undefined;
  const tail = customId.slice(MODAL_PREFIX.length);
  return tail === "small" || tail === "medium" || tail === "full"
    ? (tail as Mode)
    : undefined;
};

const handleModalSubmit = (i: Interaction): InteractionResponse => {
  const modalId = (i as any)?.data?.custom_id;
  if (typeof modalId !== "string") {
    return {
      type: 4,
      data: { content: "Invalid modal submit.", flags: 64 },
    };
  }

  const mode = parseModeFromModalId(modalId);
  if (!mode) {
    return {
      type: 4,
      data: { content: "Unknown modal type.", flags: 64 },
    };
  }

  const name = (getModalValue(i, "name") ?? "").trim();
  const statsRaw = getModalValue(i, "stats") ?? "";

  if (!name) {
    return {
      type: 4,
      data: { content: "Missing name.", flags: 64 },
    };
  }

  if (!statsRaw.trim()) {
    return {
      type: 4,
      data: { content: "Missing stats block.", flags: 64 },
    };
  }

  const stats = normalizeItemBlock(statsRaw);
  let text = stats;

  if (mode === "medium" || mode === "full") {
    const traitsRaw = getModalValue(i, "traits") ?? "";
    if (!traitsRaw.trim()) {
      return {
        type: 4,
        data: { content: "Missing traits block.", flags: 64 },
      };
    }

    const list = affinityBlockToList(traitsRaw);
    text = `${text}\n\n${list}`;
  }

  if (mode === "full") {
    const fullRaw = getModalValue(i, "full") ?? "";
    if (!fullRaw.trim()) {
      return {
        type: 4,
        data: { content: "Missing full block.", flags: 64 },
      };
    }

    const fullText = renderFullBlocks(fullRaw);
    if (fullText) text = `${text}\n\n${fullText}`;
  }

  const embed = makeEmbed({
    color: VIOLET,
    icon: "🟣",
    title: name,
    text,
  });

  return interactionEmbeds([embed], false);
};

export const beastiaryModalSmall: Route = {
  kind: "modal",
  key: `${MODAL_PREFIX}small`,
  handle: async (i) => handleModalSubmit(i),
};

export const beastiaryModalMedium: Route = {
  kind: "modal",
  key: `${MODAL_PREFIX}medium`,
  handle: async (i) => handleModalSubmit(i),
};

export const beastiaryModalFull: Route = {
  kind: "modal",
  key: `${MODAL_PREFIX}full`,
  handle: async (i) => handleModalSubmit(i),
};
