import type { Block, CalloutType } from "./parse";

type Embed = {
  title?: string;
  description?: string;
  color?: number;
};

const typeToStyle = (t: CalloutType): { icon: string; color: number } => {
  switch (String(t).toLowerCase()) {
    case "info":
      return { icon: "ℹ️", color: 0x3498db };
    case "abstract":
      return { icon: "📌", color: 0x95a5a6 };
    case "danger":
      return { icon: "⚔️", color: 0xe74c3c };
    case "note":
      return { icon: "📝", color: 0x9b59b6 };
    case "warning":
      return { icon: "⚠️", color: 0xf1c40f };
    case "success":
      return { icon: "✅", color: 0x2ecc71 };
    case "tip":
      return { icon: "💡", color: 0x2ecc71 };
    default:
      return { icon: "🔹", color: 0x5865f2 };
  }
};

const clamp = (s: string, max: number) =>
  s.length > max ? s.slice(0, max - 1) + "…" : s;

export const blocksToEmbeds = (title: string, blocks: Block[]): Embed[] => {
  const embeds: Embed[] = [];

  // Top header embed
  embeds.push({
    title: clamp(`Lexika Enotheia • ${title}`, 256),
    color: 0x2f3136,
  });

  for (const b of blocks) {
    if (b.kind === "heading") {
      embeds.push({
        title: clamp(b.text, 256),
        color: 0x2f3136,
      });
      continue;
    }

    if (b.kind === "callout") {
      const style = typeToStyle(b.ctype);
      const t = b.title?.trim() ? b.title.trim() : String(b.ctype);

      const desc = b.bodyLines.join("\n").trim();
      embeds.push({
        title: clamp(`${style.icon} ${t}`, 256),
        description: desc ? clamp(desc, 4096) : undefined,
        color: style.color,
      });
      continue;
    }

    // paragraphs are currently swallowed by selectBlocks in all modes,
    // but keep this for future-proofing:
    if (b.kind === "paragraph") {
      const desc = b.lines.join("\n").trim();
      if (!desc) continue;
      embeds.push({ description: clamp(desc, 4096), color: 0x2f3136 });
    }
  }

  return embeds;
};
