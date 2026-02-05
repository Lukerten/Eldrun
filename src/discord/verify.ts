const hexToU8 = (hex: string): Uint8Array => {
  if (hex.length % 2 !== 0) throw new Error("Invalid hex");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
};

const textToU8 = (s: string): Uint8Array => new TextEncoder().encode(s);

export const verifyDiscordRequest = async (
  req: Request,
  publicKeyHex: string,
) => {
  const signatureHex = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");

  if (!signatureHex || !timestamp) return { ok: false as const };

  const body = await req.clone().text();

  const message = textToU8(timestamp + body);
  const signature = hexToU8(signatureHex);
  const publicKey = hexToU8(publicKeyHex);

  const key = await crypto.subtle.importKey(
    "raw",
    publicKey,
    { name: "Ed25519" },
    false,
    ["verify"],
  );

  const ok = await crypto.subtle.verify("Ed25519", key, signature, message);

  return ok ? { ok: true as const, body } : { ok: false as const };
};
