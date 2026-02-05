import pino from "pino";
export type Log = ReturnType<typeof createLogger>;

export const createLogger = (bindings?: Record<string, unknown>) =>
  pino({
    name: "thorrim-worker",
    level: "info",
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(bindings ? { bindings } : {}),
  });
