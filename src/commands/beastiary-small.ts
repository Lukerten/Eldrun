import type { Cmd, Ctx } from "../registry";
import type { Interaction } from "../discord/types";
import { message } from "../discord/response";
import {
  interactionEmbeds,
  makeEmbedFromCalloutishText,
} from "../utils/embeds";

const MODAL_ID = "beastiary-small-modal";

const modal = (title: string) => ({
  type: 9,
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

export const beastiarySmall: Cmd = {
  name: "beastiary-small",
  handle: async () => modal("Bestiary Entry (Small)"),
};

export const beastiarySmallModal: Cmd = {
  name: MODAL_ID,
  handle: async (i: Interaction, ctx: Ctx) => {
    const name = getModalValue(i, "name").trim();
    const basic = getModalValue(i, "basic").trim();

    if (!name || !basic) {
      return message("Missing required modal fields.", true);
    }

    ctx.log.info(
      { cmd: "beastiary-small-modal", nameLen: name.length },
      "beastiary",
    );

    const embed = makeEmbedFromCalloutishText(name, basic);
    return interactionEmbeds([embed], false);
  },
};
