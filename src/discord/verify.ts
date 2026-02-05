import { verifyKey } from "discord-interactions";

export const verifyDiscordRequest = async (req: Request, publicKey: string) => {
  const signature = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");
  if (!signature || !timestamp) return { ok: false as const };

  const body = await req.clone().text();
  const ok = verifyKey(body, signature, timestamp, publicKey);
  return ok ? { ok: true as const, body } : { ok: false as const };
};
