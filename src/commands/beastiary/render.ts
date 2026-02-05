import type { Chunk } from "./chunk";

type Embed = { title?: string; description?: string; color?: number };

const style = (ctype: string) => {
  switch (ctype.toLowerCase()) {
    case "info":
      return { icon: "🐾", color: 0x3498db };
    case "abstract":
      return { icon: "📌", color: 0x95a5a6 };
    case "danger":
      return { icon: "⚔️", color: 0xe74c3c };
    case "note":
      return { icon: "📝", color: 0x9b59b6 };
    default:
      return { icon: "🔹", color: 0x5865f2 };
  }
};

const clamp = (s: string, max: number) =>
  s.length > max ? s.slice(0, max - 1) + "…" : s;

const isAbstractHeader = (line: string) => /^\s*\[!abstract\]\s*/i.test(line);

const stripAbstractHeader = (line: string) =>
  line.replace(/^\s*\[!abstract\]\s*/i, "").trim();

const stripAnyCalloutHeader = (line: string) =>
  line.replace(/^\s*\[![a-zA-Z]+\]\s*/g, "").trim();

const formatAbstractGroup = (lines: string[]): string => {
  const out: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (isAbstractHeader(line)) {
      const h = stripAbstractHeader(line);
      if (h) out.push(`**${h}**`);
      continue;
    }

    if (/^\s*\[![a-zA-Z]+\]/.test(line)) {
      const cleaned = stripAnyCalloutHeader(line);
      if (cleaned) out.push(cleaned);
      continue;
    }

    out.push(line);
  }

  return out.join("\n").trim();
};

export const chunksToEmbeds = (title: string, chunks: Chunk[]): Embed[] => {
  const embeds: Embed[] = [];
  embeds.push({ title: clamp(title, 256), color: 0x2f3136 });

  for (const c of chunks) {
    if (c.kind === "heading") {
      embeds.push({ title: clamp(c.lines[0] ?? "", 256), color: 0x2f3136 });
      continue;
    }

    const ctype = c.ctype ?? "note";
    const { icon, color } = style(ctype);

    if (ctype === "abstract") {
      const desc = formatAbstractGroup(c.lines);
      embeds.push({
        title: clamp(`${icon} Traits`, 256),
        description: desc ? clamp(desc, 4096) : undefined,
        color,
      });
      continue;
    }

    const first = c.lines[0] ?? "";
    const displayTitle = stripAnyCalloutHeader(first);
    const body = c.lines.slice(1).join("\n").trim();

    embeds.push({
      title: clamp(`${icon} ${displayTitle || (c.title ?? ctype)}`, 256),
      description: body ? clamp(body, 4096) : undefined,
      color,
    });
  }

  return embeds;
};
