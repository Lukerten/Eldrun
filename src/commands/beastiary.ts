import type { Cmd, Ctx } from "../registry";
import { message } from "../discord/response";
import type { Interaction } from "../discord/types";
import { chunkBestiary } from "./beastiary/chunk";
import { selectChunks, type Mode } from "./beastiary/select";
import { chunksToEmbeds } from "./beastiary/render";

const getStringOption = (i: Interaction, name: string): string | null => {
  const opts = i.data?.options ?? [];
  const found = opts.find((o) => o.name === name);
  return typeof found?.value === "string" ? found.value : null;
};

const embedsPayload = (embeds: any[]) => ({
  type: 4,
  data: { embeds },
});

const buildHandler = (mode: Mode): Cmd["handle"] => {
  return async (i: Interaction, ctx: Ctx) => {
    const title = (getStringOption(i, "title") ?? "").trim();
    const text = (getStringOption(i, "text") ?? "").trim();

    if (!title) return message("Missing required option: title", true);
    if (!text) return message("Missing required option: text", true);

    const chunks = chunkBestiary(text);
    const selected = selectChunks(chunks, mode);
    const embeds = chunksToEmbeds(title, selected);

    ctx.log.info(
      { cmd: i.data?.name, mode, chunks: chunks.length, embeds: embeds.length },
      "beastiary",
    );

    if (embeds.length > 10) {
      return message(
        `Result would create ${embeds.length} embeds, but Discord allows max 10 per message. Please shorten the entry.`,
        true,
      );
    }

    return embedsPayload(embeds);
  };
};

export const beastiarySmall: Cmd = {
  name: "beastiary-small",
  handle: buildHandler("small"),
};
export const beastiaryMedium: Cmd = {
  name: "beastiary-medium",
  handle: buildHandler("medium"),
};
export const beastiaryFull: Cmd = {
  name: "beastiary-full",
  handle: buildHandler("full"),
};
