import type { Cmd, Ctx } from "../registry";
import { message } from "../discord/response";
import type { Interaction } from "../discord/types";

const getStringOption = (i: Interaction, name: string): string | null => {
  const opts = i.data?.options ?? [];
  const found = opts.find((o) => o.name === name);
  const v = found?.value;
  return typeof v === "string" ? v : null;
};

const isQuoted = (s: string): boolean => {
  const firstNonEmpty = s.split("\n").find((l) => l.trim().length > 0);
  return firstNonEmpty ? firstNonEmpty.trimStart().startsWith(">") : false;
};

const quoteify = (s: string): string => {
  // Turn arbitrary markdown into a Discord quote block, preserving empty lines
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

    // If the user already provided a quote block (like your example), keep it.
    // Otherwise, quote-wrap it so the output format stays consistent.
    const body = isQuoted(textRaw) ? textRaw : quoteify(textRaw);

    const out = `${header}\n${body}`;

    // Discord message content limit is 2000 chars; keep an error simple for now.
    if (out.length > 2000) {
      return message(
        `Text too long (${out.length} chars). Discord limit is 2000. Please shorten it or split it.`,
        true,
      );
    }

    return message(out, false);
  },
};
