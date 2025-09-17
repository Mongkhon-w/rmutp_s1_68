import * as crypto from "crypto";

const algorithm = "aes-256-cbc";

if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY ไม่ถูกกำหนดใน environment variables!");
}

// แปลง SECRET_KEY เป็น 32 bytes ด้วย SHA-256 hash
const ENCRYPTION_KEY = crypto.createHash("sha256")
  .update(process.env.SECRET_KEY || "default_secret")
  .digest();

// log key ใน base64
console.log("key:", ENCRYPTION_KEY.toString("base64"));

// สุ่ม IV ตัวอย่าง (จะสุ่มใหม่ทุกครั้ง)
const iv = crypto.randomBytes(16);
console.log("iv:", iv.toString("hex"));

// 📌 ฟังก์ชันเข้ารหัส
export function encrypted(text: string): string {
  const iv = crypto.randomBytes(16); // 16 bytes IV
  const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  console.log(`[DECODE] input: ${text}`);
  console.log(`[ENCODE] output: ${encrypted}`);

  // return iv + ciphertext
  return iv.toString("base64") + ":" + encrypted;
}

// 📌 ฟังก์ชันถอดรหัส
export function decrypted(packed: string): string {
  const [ivB64, cipherB64] = packed.split(":");
  if (!ivB64 || !cipherB64) {
    throw new Error("Invalid encrypted format");
  }

  const iv = Buffer.from(ivB64, "base64");
  const decipher = crypto.createDecipheriv(algorithm, ENCRYPTION_KEY, iv);

  let decrypted = decipher.update(cipherB64, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}