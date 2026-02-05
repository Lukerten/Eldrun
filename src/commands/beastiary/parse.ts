export type CalloutType =
  | "info"
  | "abstract"
  | "note"
  | "danger"
  | "tip"
  | "warning"
  | "success"
  | "question"
  | string;

export type Block =
  | { kind: "heading"; text: string; level: number }
  | { kind: "callout"; ctype: CalloutType; title: string; bodyLines: string[] }
  | { kind: "paragraph"; lines: string[] };

const isHeading = (line: string) => /^#{1,6}\s+/.test(line);

const parseHeading = (line: string) => {
  const m = line.match(/^(#{1,6})\s+(.*)$/);
  return m ? { level: m[1].length, text: m[2].trim() } : null;
};

const parseCalloutStart = (line: string) => {
  const m = line.match(/^\s*>\s*\[!([a-zA-Z]+)\]\s*(.*)$/);
  if (!m) return null;
  return { ctype: m[1].toLowerCase(), title: (m[2] ?? "").trim() };
};

const stripOneLeadingQuote = (line: string) => {
  const m = line.match(/^\s*>\s?(.*)$/);
  return m ? m[1] : line;
};

export const parseBlocks = (input: string): Block[] => {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Headings
    if (isHeading(line)) {
      const h = parseHeading(line)!;
      blocks.push({ kind: "heading", text: h.text, level: h.level });
      i++;
      continue;
    }

    // Callouts
    const callout = parseCalloutStart(line);
    if (callout) {
      const bodyLines: string[] = [];
      i++;

      // consume subsequent quoted lines
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        bodyLines.push(stripOneLeadingQuote(lines[i]));
        i++;
      }

      blocks.push({
        kind: "callout",
        ctype: callout.ctype,
        title: callout.title || callout.ctype,
        bodyLines,
      });
      continue;
    }

    // Paragraph: consume until blank or next block
    const para: string[] = [];
    while (i < lines.length && lines[i].trim()) {
      if (isHeading(lines[i])) break;
      if (parseCalloutStart(lines[i])) break;
      para.push(lines[i]);
      i++;
    }
    blocks.push({ kind: "paragraph", lines: para });
  }

  return blocks;
};

export type Mode = "small" | "medium" | "full";

/**
 * Filters & trims blocks according to mode.
 * "Swallowing" extra means we drop blocks we don't need for that mode.
 */
export const selectBlocks = (blocks: Block[], mode: Mode): Block[] => {
  if (mode === "full") return blocks;

  // small: everything before first heading, but only callouts (ignore paragraphs)
  if (mode === "small") {
    const out: Block[] = [];
    for (const b of blocks) {
      if (b.kind === "heading") break; // swallow everything after heading
      if (b.kind === "callout") out.push(b);
    }
    return out;
  }

  // medium: include overview + attacks section but keep it compact
  // - include headings + callouts
  // - drop paragraphs
  // - trim danger/note callouts body lines to a preview
  if (mode === "medium") {
    const out: Block[] = [];
    let inAttacks = false;

    for (const b of blocks) {
      if (b.kind === "heading") {
        out.push(b);
        // if you have multiple headings, we keep them
        if (b.text.toLowerCase().includes("attacks")) inAttacks = true;
        continue;
      }
      if (b.kind !== "callout") continue;

      if (!inAttacks) {
        // overview section: keep full callouts
        out.push(b);
      } else {
        // attacks section: trim body
        const maxLines = b.ctype === "danger" ? 2 : b.ctype === "note" ? 3 : 3;

        out.push({
          ...b,
          bodyLines: b.bodyLines.slice(0, maxLines),
        });
      }
    }
    return out;
  }

  return blocks;
};
