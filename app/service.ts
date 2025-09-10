import * as crypto from "crypto";

// const algorithm = "aes-256-cbc";
const algorithm = "aes-256-cbc";
// const key = crypto.randomBytes(32);
// const key = `lovemelovedog`;
const key = `12345678901234567890123456789012`;
console.log(`key ${key.toString()}`);
const iv = crypto.randomBytes(16);
console.log(`iv ${iv.toString()}`);
const password = `1password1234`;

const encode = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
const encrypted = encode.update(password, "utf-8", "base64");
const encryptedStr = encrypted + encode.final("base64");
console.log(`encode `, encryptedStr);

const decode = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
const decrypted = decode.update(encryptedStr, "base64", "utf-8");
const decryptedStr = decrypted + decode.final("utf-8");
console.log(`decode `, decryptedStr);