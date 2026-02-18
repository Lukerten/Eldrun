import type {
  ParsedCallout,
  CalloutKind,
  CalloutStyle,
} from "../types/callouts";

const CALLOUT_STYLES: Record<CalloutKind, CalloutStyle> = {
  abstract: { icon: "📄", color: 0x5865f2 },
  info: { icon: "📘", color: 0x3498db },
  success: { icon: "🟢", color: 0x2ecc71 },
  warning: { icon: "⚠️", color: 0xf1c40f },
  danger: { icon: "🔴", color: 0xe74c3c },
  example: { icon: "💡", color: 0x9b59b6 },
  note: { icon: "📝", color: 0x95a5a6 },
  quote: { icon: "❝", color: 0x7f8c8d },
  tip: { icon: "💡", color: 0x1abc9c },
};

const DEFAULT_STYLE: CalloutStyle = { icon: "📄", color: 0x5865f2 };

const normalizeNewlines = (s: string) => s.replace(/\r\n/g, "\n").trim();

const stripQuotePrefix = (s: string): string =>
  s
    .split("\n")
    .map((line) => {
      const m = line.match(/^\s*>\s?(.*)$/);
      return m ? m[1] ?? "" : line;
    })
    .join("\n");

type Header = Readonly<{ kind?: CalloutKind; title?: string }>;

const parseHeader = (line: string): Header => {
  const m = line.match(/^\[!([a-zA-Z]+)\]\s*(.*)$/);
  if (!m) return {};

  const rawKind = (m[1] ?? "").toLowerCase();
  const title = (m[2] ?? "").trim();
  const titleOpt = title.length > 0 ? title : undefined;

  if (rawKind in CALLOUT_STYLES) {
    const kind = rawKind as CalloutKind;
    return titleOpt ? { kind, title: titleOpt } : { kind };
  }

  return titleOpt ? { title: titleOpt } : {};
};

export const parseCallout = (raw: string): ParsedCallout => {
  const cleaned = stripQuotePrefix(normalizeNewlines(raw));
  const lines = cleaned.split("\n");

  const headerLine = lines[0] ?? "";
  const header = parseHeader(headerLine);

  const style = header.kind ? CALLOUT_STYLES[header.kind] : DEFAULT_STYLE;

  const bodyLines = header.kind ? lines.slice(1) : lines;
  const text = bodyLines.join("\n").trim();

  return header.title
    ? { icon: style.icon, color: style.color, title: header.title, text }
    : { icon: style.icon, color: style.color, text };
};
