
import prisma from "../config/prisma.js";

export async function createRefreshToken(data, db = prisma) {
  return await db.refreshToken.create({
    data: {
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
    },
  });
}

export async function findRefreshTokenByHash(
  tokenHash,
  db = prisma
) {
  return await db.refreshToken.findUnique({
    where: { tokenHash },
  });
}

export async function revokeRefreshToken(id, db = prisma) {
  return await db.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}

export async function consumeRefreshToken(
  id,
  now = new Date(),
  db = prisma
) {
  return await db.refreshToken.updateMany({
    where: {
      id,
      revokedAt: null,
      expiresAt: { gt: now },
    },
    data: {
      revokedAt: now,
    },
  });
}
