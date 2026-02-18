import type { InteractionResponse } from "../discord/types";
import type { Embed, EmbedInput } from "../types/embeds";

const clamp = (s: string, max: number) =>
  s.length > max ? s.slice(0, max - 1) + "…" : s;

const normalizeNewlines = (s: string) => s.replace(/\r\n/g, "\n").trim();

const stripTrailingWhitespacePerLine = (s: string) =>
  s
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/g, ""))
    .join("\n");

const stripQuotePrefixPerLine = (raw: string): string =>
  raw
    .split("\n")
    .map((line) => line.replace(/^\s*>\s?/, ""))
    .join("\n");

const maybeStripBlockQuote = (raw: string): string => {
  const hasAnyQuotedLine = raw
    .split("\n")
    .some((l) => /^\s*>\s?/.test(l) && l.trim().length > 0);

  return hasAnyQuotedLine ? stripQuotePrefixPerLine(raw) : raw;
};

export const makeEmbed = ({ color, icon, text, title }: EmbedInput): Embed => {
  const cleaned = stripTrailingWhitespacePerLine(
    maybeStripBlockQuote(normalizeNewlines(text)),
  );

  const titleTrim = title?.trim();
  if (titleTrim) {
    const out: { color: number; title: string; description?: string } = {
      color,
      title: clamp(`${icon} ${titleTrim}`, 256),
    };

    if (cleaned.length > 0) out.description = clamp(cleaned, 4096);
    return out;
  }

  const desc = cleaned.length > 0 ? `${icon} ${cleaned}` : icon;
  return { color, description: clamp(desc, 4096) };
};

export const interactionEmbeds = (
  embeds: readonly Embed[],
  ephemeral = false,
): InteractionResponse => ({
  type: 4,
  data: {
    embeds: [...embeds],
    ...(ephemeral ? { flags: 64 } : {}),
  },
});
