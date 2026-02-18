import type { Interaction, InteractionResponse } from "../../discord/types";
import type { Route } from "../../types/routing";
import { interactionEmbeds } from "../../utils/embeds";
import { normalizeItemBlock } from "../../utils/items";
import { parseAffinityBlock, affinitiesToList } from "../../utils/affinity";
import { parseCallout } from "../../utils/callouts";
import { MODAL_PREFIX } from "./command";

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

const stripLeadingEmptyLines = (s: string): string => {
  const lines = s.split("\n");
  let i = 0;
  while (i < lines.length && lines[i]!.trim().length === 0) i++;
  return lines.slice(i).join("\n");
};

// Split raw (possibly quoted) input into blocks that each start with a callout header "[!...]"
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
    const isHeader = /^\s*\[![^\]]+\]-?/.test(line.trim());
    if (isHeader && buf.length > 0) flush();
    buf.push(line);
  }

  flush();
  return blocks;
};

const renderCalloutSection = (raw: string): string => {
  const blocks = splitCalloutBlocks(raw);
  if (blocks.length === 0) return "";

  const rendered: string[] = [];

  for (const b of blocks) {
    const cleanedBlock = stripLeadingEmptyLines(b).trim();
    if (!cleanedBlock) continue;

    const c = parseCallout(cleanedBlock);

    const title = (c.title ?? "").trim();
    const body = (c.text ?? "").trim();
    if (!title && !body) continue;

    const header = title ? `${c.icon} **${title}**` : `${c.icon}`;
    rendered.push(body ? `${header}\n${body}` : header);
  }

  return rendered.join("\n\n").trim();
};

const handleModalSubmit = (i: Interaction): InteractionResponse => {
  const customId = (i as any)?.data?.custom_id;
  if (typeof customId !== "string") {
    return { type: 4, data: { content: "Invalid modal.", flags: 64 } };
  }

  const mode = customId.startsWith(MODAL_PREFIX)
    ? customId.slice(MODAL_PREFIX.length)
    : "";

  const statsRaw = getModalValue(i, "stats") ?? "";
  if (!statsRaw.trim()) {
    return { type: 4, data: { content: "Missing info block.", flags: 64 } };
  }

  const stats = normalizeItemBlock(statsRaw);
  let text = "## " + stats;

  if (mode === "medium" || mode === "full") {
    const traitsRaw = getModalValue(i, "traits") ?? "";
    if (!traitsRaw.trim()) {
      return { type: 4, data: { content: "Missing traits block.", flags: 64 } };
    }

    const entries = parseAffinityBlock(traitsRaw);

    if (entries.length === 0) {
      return {
        type: 4,
        data: {
          content:
            "Traits could not be parsed. Expected headings like 'Weakness' and bullets like '- Fire'.",
          flags: 64,
        },
      };
    }

    const list = affinitiesToList(entries);
    text = `${text}\n\n${list}`;
  }

  if (mode === "full") {
    const attacksRaw = getModalValue(i, "attacks") ?? "";
    if (!attacksRaw.trim()) {
      return {
        type: 4,
        data: { content: "Missing attacks block.", flags: 64 },
      };
    }

    const spellsRaw = getModalValue(i, "spells") ?? "";
    const passivesRaw = getModalValue(i, "passives") ?? "";

    const attacks = renderCalloutSection(attacksRaw);
    const spells = spellsRaw.trim() ? renderCalloutSection(spellsRaw) : "";
    const passives = passivesRaw.trim()
      ? renderCalloutSection(passivesRaw)
      : "";

    if (attacks) text += `\n\n## **Attacks**\n${attacks}`;
    if (spells) text += `\n\n## **Spells**\n${spells}`;
    if (passives) text += `\n\n## **Passives**\n${passives}`;
  }

  const description = text.length > 0 ? text.slice(0, 4096) : undefined;
  const embed = description
    ? { color: VIOLET, description }
    : { color: VIOLET };

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
