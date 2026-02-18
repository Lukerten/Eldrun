const normalizeNewlines = (s: string) => s.replace(/\r\n/g, "\n").trim();

const stripTrailingWhitespacePerLine = (s: string) =>
  s
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/g, ""))
    .join("\n");

const stripQuotePrefixPerLine = (s: string) =>
  s
    .split("\n")
    .map((line) => line.replace(/^\s*>\s?/, ""))
    .join("\n");

const stripCalloutMarker = (line: string): string =>
  line.replace(/^\s*\[![^\]]+\]\s*/, "");

const splitLines = (s: string) => s.split("\n");

export const normalizeItemBlock = (itemRaw: string): string => {
  const unquoted = stripQuotePrefixPerLine(
    stripTrailingWhitespacePerLine(normalizeNewlines(itemRaw)),
  );

  const lines = splitLines(unquoted);
  if (lines.length === 0) return "";

  const first = stripCalloutMarker(lines[0] ?? "");
  const rest = lines.slice(1);

  return [first, ...rest].join("\n").trim();
};

export const normalizeRestBlocks = (restRaw: string): string => {
  const cleaned = stripTrailingWhitespacePerLine(normalizeNewlines(restRaw));
  const lines = splitLines(cleaned);

  const out = lines.map((line) => {
    const m = line.match(/^(\s*>\s?)\s*\[![^\]]+\]\s*(.*)$/);
    if (!m) return line;

    const prefix = m[1] ?? "> ";
    const rest = (m[2] ?? "").trimEnd();
    return `${prefix}${rest}`;
  });

  return out.join("\n").trim();
};

export const renderItemMessage = (itemRaw: string, restRaw: string): string => {
  const item = normalizeItemBlock(itemRaw);
  const rest = normalizeRestBlocks(restRaw);

  if (item.length === 0) return rest;
  if (rest.length === 0) return item;

  return `${item}\n\n${rest}`;
};
