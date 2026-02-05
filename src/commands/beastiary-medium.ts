import type { Cmd, Ctx } from "../registry";
import type { Interaction } from "../discord/types";
import { message } from "../discord/response";
import {
  interactionEmbeds,
  makeEmbedFromCalloutishText,
  normalizeQuotedText,
} from "../utils/embeds";
import { parseCalloutHeader } from "../utils/callouts";

const MODAL_ID = "beastiary-medium-modal";

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

export const beastiaryMedium: Cmd = {
  name: "beastiary-medium",
  handle: async () => modal("Bestiary Entry (Medium)"),
};

export const beastiaryMediumModal: Cmd = {
  name: MODAL_ID,
  handle: async (i: Interaction, ctx: Ctx) => {
    const name = getModalValue(i, "name").trim();
    const basic = getModalValue(i, "basic").trim();
    const resistancesRaw = getModalValue(i, "resistances").trim();

    if (!name || !basic || !resistancesRaw) {
      return message("Missing required modal fields.", true);
    }

    ctx.log.info(
      { cmd: "beastiary-medium-modal", nameLen: name.length },
      "beastiary",
    );

    const basicEmbed = makeEmbedFromCalloutishText(name, basic);

    // Keep markdown, just normalize quoting and parse the [!abstract] header for icon/color.
    const normalized = normalizeQuotedText(resistancesRaw);
    const rawLines = normalized
      .split("\n")
      .map((l) => l.replace(/[ \t]+$/g, ""));

    while (rawLines.length && rawLines[0].trim() === "") rawLines.shift();
    while (rawLines.length && rawLines[rawLines.length - 1].trim() === "")
      rawLines.pop();

    const first = (rawLines[0] ?? "").trim();
    const { style, stripped } = parseCalloutHeader(first);

    const bodyLines = [
      stripped ? `**${stripped}**` : first,
      ...rawLines.slice(1),
    ];
    const description = bodyLines.join("\n").trim();

    const traitsEmbed = {
      title: `${style.icon} Traits`,
      description,
      color: style.color,
    };

    return interactionEmbeds([basicEmbed, traitsEmbed], false);
  },
};
