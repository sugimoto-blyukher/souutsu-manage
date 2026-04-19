import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const IV_LENGTH = 12;

const deriveKey = (secret: string): Buffer => createHash("sha256").update(secret).digest();

export const encrypt = (plainText: string, secret: string): string => {
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(secret);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
};

export const decrypt = (encodedCipherText: string, secret: string): string => {
  const payload = Buffer.from(encodedCipherText, "base64");
  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = payload.subarray(IV_LENGTH + 16);
  const key = deriveKey(secret);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
};
