
import "dotenv/config";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}

export const JWT_SECRET = jwtSecret;

export const JWT_EXPIRES_IN =
  process.env.JWT_EXPIRES_IN || "15m";

export const REFRESH_TOKEN_EXPIRES_IN_DAYS = Number(
  process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 7
);
