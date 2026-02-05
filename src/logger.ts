export type Log = Readonly<{
  info: (obj: unknown, msg?: string) => void;
  warn: (obj: unknown, msg?: string) => void;
  error: (obj: unknown, msg?: string) => void;
}>;

const emit = (level: "info" | "warn" | "error", obj: unknown, msg?: string) => {
  const payload =
    msg === undefined
      ? { level, ...asObject(obj) }
      : { level, msg, ...asObject(obj) };

  const line = JSON.stringify(payload);

  if (level === "info") console.log(line);
  else if (level === "warn") console.warn(line);
  else console.error(line);
};

const asObject = (x: unknown): Record<string, unknown> => {
  if (x && typeof x === "object" && !Array.isArray(x))
    return x as Record<string, unknown>;
  return { data: x };
};

export const createLogger = (): Log => ({
  info: (obj, msg) => emit("info", obj, msg),
  warn: (obj, msg) => emit("warn", obj, msg),
  error: (obj, msg) => emit("error", obj, msg),
});
