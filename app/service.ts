
import * as crypto from "crypto";

const algorithm = "aes-256-cbc";


const SECRET_KEY = process.env.SECRET_KEY || "my-secret-key";


const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(SECRET_KEY)
  .digest()
  .subarray(0, 32);


export function encode(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  const packed = iv.toString("base64") + ":" + encrypted;

  console.log(`[ENCODE] input: ${text}`);
  console.log(`[ENCODE] output: ${encrypted}`);
  return packed;
}

export function decode(packed: string): string {
  const [ivB64, cipherB64] = packed.split(":");
  if (!ivB64 || !cipherB64) {
    throw new Error("Invalid payload format");
  }

  const iv = Buffer.from(ivB64, "base64");
  const decipher = crypto.createDecipheriv(algorithm, ENCRYPTION_KEY, iv);

  let decrypted = decipher.update(cipherB64, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}