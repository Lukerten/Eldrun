import type { Affinity, AffinityEntry, Element } from "../types/affinities";

const normalizeNewlines = (s: string) => s.replace(/\r\n/g, "\n").trim();

const stripQuotePrefixPerLine = (s: string) =>
  s
    .split("\n")
    .map((line) => line.replace(/^\s*>\s?/, ""))
    .join("\n");

const stripCalloutHeaderLine = (s: string) => {
  const lines = s.split("\n");
  if (lines.length === 0) return s;

  const first = (lines[0] ?? "").trim();
  const isCalloutHeader = /^\[![^\]]+\]/.test(first);

  return (isCalloutHeader ? lines.slice(1) : lines).join("\n");
};

export const ELEMENT_ICON: Readonly<Record<Element, string>> = {
  Physical: "🗡️",
  Fire: "🔥",
  Air: "🌪️",
  Bolt: "⚡",
  Ice: "❄️",
  Earth: "🪨",
  Light: "✨",
  Dark: "🌑",
  Poison: "☠️",
};

export const AFFINITY_ICON: Readonly<Record<Affinity, string>> = {
  Weakness: "🟥",
  Resistance: "🟦",
  Immunity: "⛔",
  Absorption: "🟪",
};

export const formatElement = (e: Element) => `${ELEMENT_ICON[e]} ${e}`;

export const formatAffinity = (a: Affinity) => `${AFFINITY_ICON[a]} ${a}`;

const parseElement = (raw: string): Element | undefined => {
  const s = raw.trim().toLowerCase();

  if (s === "physical") return "Physical";
  if (s === "fire") return "Fire";
  if (s === "air") return "Air";
  if (s === "bolt" || s === "lightning") return "Bolt";
  if (s === "ice") return "Ice";
  if (s === "earth") return "Earth";
  if (s === "light") return "Light";
  if (s === "dark") return "Dark";
  if (s === "poison") return "Poison";

  return undefined;
};

const parseAffinity = (raw: string): Affinity | undefined => {
  const s = raw.trim().toLowerCase();

  if (s === "weakness" || s === "weaknesses") return "Weakness";
  if (s === "resistance" || s === "resistances" || s === "resist")
    return "Resistance";
  if (s === "immunity" || s === "immune") return "Immunity";
  if (s === "absorption" || s === "absorb" || s === "absorbtion")
    return "Absorption";

  return undefined;
};

export const parseAffinityBlock = (raw: string): readonly AffinityEntry[] => {
  const cleaned = stripCalloutHeaderLine(
    stripQuotePrefixPerLine(normalizeNewlines(raw)),
  );

  const lines = cleaned.split("\n");

  let current: Affinity | undefined;
  const out: AffinityEntry[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;

    const maybeHeading = parseAffinity(t.replace(/:$/, ""));
    if (maybeHeading) {
      current = maybeHeading;
      continue;
    }

    const bullet = t.match(/^-\s+(.*)$/);
    if (bullet && current) {
      const elementRaw = (bullet[1] ?? "").trim();
      const el = parseElement(elementRaw);
      if (!el) continue;

      const key = `${el}|${current}`;
      if (!seen.has(key)) {
        out.push({ element: el, affinity: current });
        seen.add(key);
      }
    }
  }

  return out;
};

export const affinitiesToList = (entries: readonly AffinityEntry[]): string => {
  if (entries.length === 0) return "—";

  return entries
    .map((e) => `- ${formatAffinity(e.affinity)}: ${formatElement(e.element)}`)
    .join("\n");
};

export const affinityBlockToList = (raw: string): string =>
  affinitiesToList(parseAffinityBlock(raw));
