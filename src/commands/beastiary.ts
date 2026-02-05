import type { Cmd, Ctx } from "../registry";
import { message } from "../discord/response";
import type { Interaction } from "../discord/types";
import { parseBlocks, selectBlocks, type Mode } from "./beastiary/parse";
import { blocksToEmbeds } from "./beastiary/render";

const getStringOption = (i: Interaction, name: string): string | null => {
  const opts = i.data?.options ?? [];
  const found = opts.find((o) => o.name === name);
  return typeof found?.value === "string" ? found.value : null;
};

const toDiscordEmbedsPayload = (embeds: any[]) => ({
  type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
  data: { embeds },
});

const chunk = <T>(arr: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const buildBeastiaryHandler = (mode: Mode): Cmd["handle"] => {
  return async (i: Interaction, ctx: Ctx) => {
    const title = (getStringOption(i, "title") ?? "").trim();
    const text = (getStringOption(i, "text") ?? "").trim();

    if (!title) return message("Missing required option: title", true);
    if (!text) return message("Missing required option: text", true);

    const blocks = parseBlocks(text);
    const selected = selectBlocks(blocks, mode);
    const embeds = blocksToEmbeds(title, selected);

    ctx.log.info(
      { cmd: i.data?.name, mode, embeds: embeds.length },
      "beastiary render",
    );

    // Discord allows max 10 embeds per response.
    // For now we enforce <= 10 and ask to shorten if too big.
    if (embeds.length > 10) {
      return message(
        `Result would create ${embeds.length} embeds, but Discord allows max 10 per message. ` +
          `Please shorten the entry or use a smaller mode.`,
        true,
      );
    }

    return toDiscordEmbedsPayload(embeds);
  };
};

export const beastiarySmall: Cmd = {
  name: "beastiary-small",
  handle: buildBeastiaryHandler("small"),
};
export const beastiaryMedium: Cmd = {
  name: "beastiary-medium",
  handle: buildBeastiaryHandler("medium"),
};
export const beastiaryFull: Cmd = {
  name: "beastiary-full",
  handle: buildBeastiaryHandler("full"),
};
