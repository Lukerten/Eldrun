const hexToU8 = (hex: string): Uint8Array<ArrayBuffer> => {
  if (hex.length % 2 !== 0) throw new Error("Invalid hex");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  return out as unknown as Uint8Array<ArrayBuffer>;
};

const textToU8 = (s: string): Uint8Array<ArrayBufferLike> =>
  new TextEncoder().encode(s);

const toArrayBufferU8 = (
  u8: Uint8Array<ArrayBufferLike>,
): Uint8Array<ArrayBuffer> => {
  const ab = u8.buffer.slice(
    u8.byteOffset,
    u8.byteOffset + u8.byteLength,
  ) as ArrayBuffer;
  return new Uint8Array(ab);
};

export const verifyDiscordRequest = async (
  req: Request,
  publicKeyHex: string,
) => {
  const signatureHex = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");
  if (!signatureHex || !timestamp) return { ok: false as const };

  const body = await req.clone().text();

  const message = toArrayBufferU8(textToU8(timestamp + body));
  const signature = toArrayBufferU8(hexToU8(signatureHex));
  const publicKey = toArrayBufferU8(hexToU8(publicKeyHex));

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
