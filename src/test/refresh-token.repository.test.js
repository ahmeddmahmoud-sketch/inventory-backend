
import test, { after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import prisma from "../config/prisma.js";
import {
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
} from "../repositories/refreshToken.repository.js";

let testUser;
let createdToken;

const tokenHash = crypto.randomBytes(32).toString("hex");

after(async () => {
  try {
    if (createdToken?.id) {
      await prisma.refreshToken.deleteMany({
        where: { id: createdToken.id },
      });
    }

    if (testUser?.id) {
      await prisma.user.deleteMany({
        where: { id: testUser.id },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
});

test("creates, finds, and revokes a refresh token", async () => {
  testUser = await prisma.user.create({
    data: {
      name: "Refresh Token Test",
      email: `refresh-repo-${Date.now()}@example.com`,
      passwordHash: "test-only-hash",
    },
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  createdToken = await createRefreshToken({
    userId: testUser.id,
    tokenHash,
    expiresAt,
  });

  assert.equal(createdToken.userId, testUser.id);
  assert.equal(createdToken.tokenHash, tokenHash);
  assert.equal(createdToken.revokedAt, null);

  const foundToken = await findRefreshTokenByHash(tokenHash);

  assert.equal(foundToken.id, createdToken.id);

  const revokedToken = await revokeRefreshToken(createdToken.id);

  assert.ok(revokedToken.revokedAt instanceof Date);

  const foundAgain = await findRefreshTokenByHash(tokenHash);

  assert.ok(foundAgain.revokedAt instanceof Date);
});
