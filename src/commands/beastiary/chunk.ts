export type ChunkKind = "callout" | "heading";

export type Chunk = Readonly<{
  kind: ChunkKind;
  // for callouts only
  ctype?: string;
  title?: string;
  lines: string[]; // lines WITHOUT the leading "> "
}>;

const isCalloutStart = (s: string) => /^\s*\[!([a-zA-Z]+)\]\s*/.test(s);
const parseCalloutStart = (s: string) => {
  const m = s.match(/^\s*\[!([a-zA-Z]+)\]\s*(.*)$/);
  if (!m) return null;
  return { ctype: m[1].toLowerCase(), title: (m[2] ?? "").trim() };
};

const isHeading = (s: string) => /^#{1,6}\s+/.test(s);
const stripHeading = (s: string) => s.replace(/^#{1,6}\s+/, "").trim();

const stripQuotePrefix = (s: string) => s.replace(/^\s*>\s?/, "");

const tokenizeInline = (raw: string): string[] => {
  let s = raw.trim().replace(/\r\n/g, "\n");
  s = s.replace(/\s+(#{1,6}\s+)/g, "\n$1");
  s = s.replace(/\s+>\s*/g, "\n> ");

  return s
    .split("\n")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
};

export const chunkBestiary = (raw: string): Chunk[] => {
  const tokens = tokenizeInline(raw);
  const chunks: Chunk[] = [];

  let i = 0;
  const pushHeading = (text: string) => {
    chunks.push({ kind: "heading", lines: [text] });
  };

  const pushCalloutChunk = (ctype: string, title: string, lines: string[]) => {
    chunks.push({ kind: "callout", ctype, title, lines });
  };

  while (i < tokens.length) {
    const t = tokens[i];

    if (isHeading(t)) {
      pushHeading(stripHeading(t));
      i++;
      continue;
    }

    if (t.startsWith(">")) {
      const content = stripQuotePrefix(t);
      if (isCalloutStart(content)) {
        const start = parseCalloutStart(content)!;

        if (start.ctype === "abstract") {
          const lines: string[] = [];
          lines.push(content);
          i++;

          while (i < tokens.length) {
            const nt = tokens[i];

            if (isHeading(nt)) break;

            if (nt.startsWith(">")) {
              const nc = stripQuotePrefix(nt);

              if (isCalloutStart(nc)) {
                const nstart = parseCalloutStart(nc)!;
                if (nstart.ctype !== "abstract") break;
                lines.push(nc);
                i++;
                continue;
              }

              if (nc.length > 0) lines.push(nc);
              i++;
              continue;
            }

            break;
          }

          pushCalloutChunk("abstract", "Traits", lines);
          continue;
        }

        const lines: string[] = [];
        lines.push(content);
        i++;

        while (i < tokens.length) {
          const nt = tokens[i];
          if (isHeading(nt)) break;

          if (nt.startsWith(">")) {
            const nc = stripQuotePrefix(nt);
            if (isCalloutStart(nc)) break;
            if (nc.length > 0) lines.push(nc);
            i++;
            continue;
          }

          break;
        }

        pushCalloutChunk(start.ctype, start.title || start.ctype, lines);
        continue;
      }

      if (chunks.length > 0) {
        const last = chunks[chunks.length - 1];
        chunks[chunks.length - 1] = {
          ...last,
          lines: [...last.lines, content],
        };
      } else {
        pushCalloutChunk("note", "Text", [content]);
      }
      i++;
      continue;
    }

    chunks.push({ kind: "heading", lines: [t] });
    i++;
  }

  return chunks;
};
