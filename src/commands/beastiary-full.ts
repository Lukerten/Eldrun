import type { Interaction } from "../discord/types";
import type { Handler } from "../registry";
import { message } from "../discord/response";
import {
  interactionEmbeds,
  makeEmbedFromCalloutishText,
  normalizeInlineQuotes,
} from "../utils/embeds";
import { parseCalloutHeader } from "../utils/callouts";

const MODAL_ID = "beastiary-full-modal";

const modal = (title: string) => ({
  type: 9, // MODAL
  data: {
    custom_id: MODAL_ID,
    title,
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "name",
            label: "Name",
            style: 1,
            required: true,
            max_length: 100,
            placeholder: "Monster Name",
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "basic",
            label: "Basic block",
            style: 2,
            required: true,
            max_length: 1800,
            placeholder: "Lv • Rank • Kind • Turns ...",
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "resistances",
            label: "Traits / Resistances",
            style: 2,
            required: true,
            max_length: 1800,
            placeholder: "[!abstract] Traits ...",
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "attacks",
            label: "Attacks & passives",
            style: 2,
            required: false,
            max_length: 3000,
            placeholder: "[!danger] Attack • ...",
          },
        ],
      },
    ],
  },
});

const getModalValue = (i: Interaction, id: string): string => {
  const data: any = i.data;
  const rows = data?.components ?? [];
  for (const row of rows) {
    const comps = row?.components ?? [];
    for (const c of comps) {
      if (c?.custom_id === id && typeof c?.value === "string") return c.value;
    }
  }
  return "";
};

const splitBlocks = (raw: string): string[] => {
  const s = raw.replace(/\r\n/g, "\n").trim();
  if (!s) return [];
  return s
    .split(/\n{2,}/g) // blank line separates blocks
    .map((b) => b.trim())
    .filter(Boolean);
};

const makeTraitsEmbed = (raw: string) => {
  const normalized = normalizeInlineQuotes(raw);
  const lines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const first = lines[0] ?? "";
  const { style, stripped } = parseCalloutHeader(first);

  // sanitize: drop [!abstract] prefix from any header lines and bold them
  const body = lines
    .map((line) => {
      const m = line.match(/^\[!abstract\]\s*(.*)$/i);
      if (!m) return line;
      const h = (m[1] ?? "").trim();
      return h ? `**${h}**` : "";
    })
    .filter(Boolean)
    .join("\n");

  return {
    title: `${style.icon} Traits`,
    description: stripped
      ? `**${stripped}**\n${body.split("\n").slice(1).join("\n")}`
      : body,
    color: style.color,
  };
};

const makeAttackEmbed = (name: string, raw: string) => {
  // allow plain blocks or blocks that start with [!danger]/[!note]
  const normalized = normalizeInlineQuotes(raw);
  const lines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;

  const first = lines[0];
  const { style, stripped } = parseCalloutHeader(first);

  const titleText = stripped || first;
  const desc = lines.slice(1).join("\n").trim();

  return {
    title: `${style.icon} ${titleText}`,
    description: desc || undefined,
    color: style.color,
  };
};

export const beastiaryFull: { name: string; handle: Handler } = {
  name: "beastiary-full",
  handle: async () => modal("Bestiary Entry (Full)"),
};

export const beastiaryFullModal: { name: string; handle: Handler } = {
  name: MODAL_ID,
  handle: async (i, ctx) => {
    const name = getModalValue(i, "name").trim();
    const basic = getModalValue(i, "basic").trim();
    const resistances = getModalValue(i, "resistances").trim();
    const attacks = getModalValue(i, "attacks").trim();

    if (!name || !basic || !resistances) {
      return message("Missing required modal fields.", true);
    }

    const basicEmbed = makeEmbedFromCalloutishText(name, basic);
    const traitsEmbed = makeTraitsEmbed(resistances);

    const attackBlocks = splitBlocks(attacks);
    const attackEmbeds = attackBlocks
      .map((b) => makeAttackEmbed(name, b))
      .filter((e): e is NonNullable<typeof e> => Boolean(e));

    const embeds = [basicEmbed, traitsEmbed, ...attackEmbeds];

    ctx.log.info(
      { cmd: "beastiary-full-modal", name, embeds: embeds.length },
      "beastiary full",
    );

    if (embeds.length > 10) {
      return message(
        `Too many embeds (${embeds.length}). Discord allows max 10 per message. Reduce attack blocks.`,
        true,
      );
    }

    return interactionEmbeds(embeds, false);
  },
};
