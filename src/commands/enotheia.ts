import type { Cmd, Ctx } from "../registry";
import { message } from "../discord/response";
import type {
  Interaction,
  InteractionDataCommand,
  InteractionOption,
} from "../discord/types";

const getStringOption = (i: Interaction, name: string): string | null => {
  const data = i.data;
  if (!data || !("options" in data)) return null;

  const opts = (data as InteractionDataCommand).options ?? [];
  const found = opts.find((o: InteractionOption) => o.name === name);
  const v = found?.value;
  return typeof v === "string" ? v : null;
};

const isQuoted = (s: string): boolean => {
  const firstNonEmpty = s.split("\n").find((l) => l.trim().length > 0);
  return firstNonEmpty ? firstNonEmpty.trimStart().startsWith(">") : false;
};

const quoteify = (s: string): string => {
  return s
    .split("\n")
    .map((line) => (line.trim().length === 0 ? ">" : `> ${line}`))
    .join("\n");
};

export const enotheia: Cmd = {
  name: "enotheia",
  handle: async (i, ctx: Ctx) => {
    const title = (getStringOption(i, "title") ?? "").trim();
    const textRaw = (getStringOption(i, "text") ?? "").trim();

    if (!title) return message("Missing required option: title", true);
    if (!textRaw) return message("Missing required option: text", true);

    ctx.log.info(
      { cmd: "enotheia", titleLen: title.length, textLen: textRaw.length },
      "interaction",
    );

    const header = `> Lexika Enotheia • ${title}`;

    const body = isQuoted(textRaw) ? textRaw : quoteify(textRaw);

    const out = `${header}\n${body}`;

    if (out.length > 2000) {
      return message(
        `Text too long (${out.length} chars). Discord limit is 2000. Please shorten it or split it.`,
        true,
      );
    }

    return message(out, false);
  },
};
