import * as crypto from "crypto";
import { ENCRYPTION_KEY, IV_LENGTH } from "../config/constants";

export function encryptData(text: string): string | null {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (e) {
    console.error("Erro ao ofuscar dados", e);
    return null;
  }
}

export function decryptData(text: string): string | null {
  try {
    const textParts = text.split(":");
    if (textParts.length !== 2) return null;
    const iv = Buffer.from(textParts[0], "hex");
    const encryptedText = Buffer.from(textParts[1], "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (e) {
    console.error("Erro ao desofuscar dados", e);
    return null;
  }
}
