"use strict";
const crypto = require("node:crypto");

function getKey() {
  const raw = process.env.ENCRYPTION_KEY || "";
  if (raw.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-char hex string (32 bytes). Generate one with: " +
      "node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(raw, "hex");
}

// AES-256-GCM: random 12-byte IV + auth tag, all base64-joined so it fits in one TEXT column.
function encryptSecret(plain) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(".");
}

function decryptSecret(packed) {
  const key = getKey();
  const [ivB64, tagB64, dataB64] = String(packed).split(".");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}

function maskSecret(plain) {
  const s = String(plain || "");
  if (s.length <= 6) return "*".repeat(s.length);
  return s.slice(0, 3) + "…" + s.slice(-4);
}

module.exports = { encryptSecret, decryptSecret, maskSecret };
