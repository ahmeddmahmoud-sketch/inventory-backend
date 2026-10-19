
import crypto from "node:crypto";

export function generateRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
