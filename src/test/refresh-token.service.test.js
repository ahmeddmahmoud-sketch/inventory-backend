
import test, { after } from "node:test";
import assert from "node:assert/strict";
import prisma from "../config/prisma.js";

import {
  createUserService,
} from "../services/user.service.js";

import {
  createRefreshTokenService,
  refreshAccessTokenService,
} from "../services/refreshToken.service.js";

import {
  hashRefreshToken,
} from "../utils/refreshToken.js";

import AppError from "../utils/AppError.js";

let testUser;

after(async () => {
  try {
    if (testUser?.id) {
      await prisma.refreshToken.deleteMany({
        where: { userId: testUser.id },
      });

      await prisma.user.deleteMany({
        where: { id: testUser.id },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
});

async function createTestUser() {
  return await createUserService({
    name: "Refresh Token Test User",
    email: `refresh-test-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}@example.com`,
    password: "TestPassword123!",
  });
}

async function expectUnauthorized(promise) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.statusCode, 401);
    return true;
  });
}

test("Rotates a valid refresh token", async () => {
  testUser = await createTestUser();

  const original = await createRefreshTokenService(testUser.id);

  const result = await refreshAccessTokenService(original.token);

  assert.equal(typeof result.token, "string");
  assert.equal(typeof result.refreshToken, "string");
  assert.notEqual(result.refreshToken, original.token);

  const oldToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash: hashRefreshToken(original.token),
    },
  });

  const newToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash: hashRefreshToken(result.refreshToken),
    },
  });

  assert.ok(oldToken?.revokedAt instanceof Date);
  assert.ok(newToken);
  assert.equal(newToken.userId, testUser.id);
  assert.equal(newToken.revokedAt, null);
});

test("Rejects reuse of the old refresh token", async () => {
  const original = await createRefreshTokenService(testUser.id);

  const firstResult = await refreshAccessTokenService(original.token);

  await expectUnauthorized(
    refreshAccessTokenService(original.token)
  );

  await prisma.refreshToken.deleteMany({
    where: {
      tokenHash: hashRefreshToken(firstResult.refreshToken),
    },
  });
});

test("Rejects an unknown refresh token", async () => {
  await expectUnauthorized(
    refreshAccessTokenService("invalid-refresh-token")
  );
});

test("Rejects an expired refresh token", async () => {
  const expiredToken = `expired-${Date.now()}`;

  await prisma.refreshToken.create({
    data: {
      userId: testUser.id,
      tokenHash: hashRefreshToken(expiredToken),
      expiresAt: new Date(Date.now() - 60_000),
    },
  });

  await expectUnauthorized(
    refreshAccessTokenService(expiredToken)
  );

  await prisma.refreshToken.deleteMany({
    where: {
      tokenHash: hashRefreshToken(expiredToken),
    },
  });
});



test("Rejects refresh for an inactive user", async () => {
  const refresh = await createRefreshTokenService(testUser.id);

  await prisma.user.update({
    where: { id: testUser.id },
    data: { isActive: false },
  });

  try {
    await expectUnauthorized(
      refreshAccessTokenService(refresh.token)
    );
  } finally {
    await prisma.user.update({
      where: { id: testUser.id },
      data: { isActive: true },
    });
  }
});



test("Only one concurrent refresh request succeeds", async () => {
  const original = await createRefreshTokenService(testUser.id);

  const results = await Promise.allSettled([
    refreshAccessTokenService(original.token),
    refreshAccessTokenService(original.token),
  ]);

  const fulfilled = results.filter(
    (result) => result.status === "fulfilled"
  );

  const rejected = results.filter(
    (result) => result.status === "rejected"
  );

  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);

  assert.equal(
    rejected[0].reason.statusCode,
    401
  );

  const newRefreshToken = fulfilled[0].value.refreshToken;

  const storedNewToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash: hashRefreshToken(newRefreshToken),
    },
  });

  assert.ok(storedNewToken);
  assert.equal(storedNewToken.revokedAt, null);
});
