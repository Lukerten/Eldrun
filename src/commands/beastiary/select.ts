import type { Chunk } from "./chunk";

export type Mode = "small" | "medium" | "full";

export const selectChunks = (chunks: Chunk[], mode: Mode): Chunk[] => {
  const info = chunks.find((c) => c.kind === "callout" && c.ctype === "info");
  const traits = chunks.find(
    (c) => c.kind === "callout" && c.ctype === "abstract",
  );

  if (mode === "small") {
    return info ? [info] : [];
  }

  if (mode === "medium") {
    const out: Chunk[] = [];
    if (info) out.push(info);
    if (traits) out.push(traits);
    return out;
  }

  return chunks;
};
