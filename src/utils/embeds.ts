import type { InteractionResponse } from "../discord/types";
import { parseCalloutHeader } from "./callouts";

export type Embed = Readonly<{
  title?: string;
  description?: string;
  color?: number;
}>;

const clamp = (s: string, max: number) =>
  s.length > max ? s.slice(0, max - 1) + "…" : s;

const splitInline = (raw: string): string[] => {
  const s = raw.trim().replace(/\r\n/g, "\n");
  const withBreaks = s.replace(/\s+>\s*/g, "\n> ");
  return withBreaks.split("\n");
};

export const normalizeQuotedText = (raw: string): string => {
  const lines = splitInline(raw).map((l) => l.replace(/[ \t]+$/g, ""));

  const out: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*>\s?(.*)$/);
    if (m) {
      const content = m[1] ?? "";
      out.push(content);
    } else {
      out.push(line.trim());
    }
  }

  while (out.length && out[0].trim() === "") out.shift();
  while (out.length && out[out.length - 1].trim() === "") out.pop();

  return out.join("\n");
};

export const normalizeInlineQuotes = normalizeQuotedText;
export const makeEmbedFromCalloutishText = (
  name: string,
  raw: string,
): Embed => {
  const normalized = normalizeQuotedText(raw);
  const lines = normalized
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/g, ""))
    .filter((l) => l.trim().length > 0);

  const first = lines[0] ?? "";
  const { style, stripped } = parseCalloutHeader(first);

  const descLines = [stripped || first, ...lines.slice(1)].filter(
    (l) => l.trim().length > 0,
  );

  return {
    title: clamp(`${style.icon} ${name}`, 256),
    description: clamp(descLines.join("\n"), 4096),
    color: style.color,
  };
};

export const interactionEmbeds = (
  embeds: Embed[],
  ephemeral = false,
): InteractionResponse => ({
  type: 4,
  data: {
    embeds,
    flags: ephemeral ? 64 : undefined,
  },
});
