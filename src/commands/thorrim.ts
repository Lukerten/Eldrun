import type { Cmd, Ctx } from "../registry";
import { message } from "../discord/response";
import type { Interaction } from "../discord/types";

const getSubcommand = (i: Interaction): string | null => {
  const opts = i.data?.options;
  if (!opts?.length) return null;
  return opts[0]?.name ?? null;
};

export const thorrim: Cmd = {
  name: "thorrim",
  handle: async (i, ctx: Ctx) => {
    const sub = getSubcommand(i);
    ctx.log.info({ cmd: "thorrim", sub }, "interaction");

    if (sub === "beast") return message("✅ /thorrim beast (stub)", true);
    if (sub === "lexika") return message("✅ /thorrim lexika (stub)", true);

    return message("Unknown subcommand.", true);
  },
};
