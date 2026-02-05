export type CalloutStyle = Readonly<{
  icon: string;
  color: number;
  titlePrefix?: string;
}>;

const styles: Record<string, CalloutStyle> = {
  info: { icon: "🐾", color: 0x3498db },
  abstract: { icon: "📌", color: 0x95a5a6 },
  danger: { icon: "⚔️", color: 0xe74c3c },
  note: { icon: "📝", color: 0x9b59b6 },
  warning: { icon: "⚠️", color: 0xf1c40f },
  success: { icon: "✅", color: 0x2ecc71 },
  tip: { icon: "💡", color: 0x2ecc71 },
};

export const parseCalloutHeader = (
  s: string,
): Readonly<{
  style: CalloutStyle;
  stripped: string;
}> => {
  const m = s.trim().match(/^\[!([a-zA-Z]+)\]\s*(.*)$/);
  if (!m) return { style: styles.info, stripped: s.trim() };

  const key = m[1].toLowerCase();
  const style = styles[key] ?? { icon: "🔹", color: 0x5865f2 };
  return { style, stripped: (m[2] ?? "").trim() };
};
