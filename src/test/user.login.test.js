
import test, { after } from "node:test";
import assert from "node:assert/strict";
import prisma from "../config/prisma.js";

import {
  createUserService,
  loginUserService,
} from "../services/user.service.js";

import {
  hashRefreshToken,
} from "../utils/refreshToken.js";

import {
  findRefreshTokenByHash,
} from "../repositories/refreshToken.repository.js";

const testEmail = `login-test-${Date.now()}@example.com`;
const testPassword = "TestPassword123!";

let testUser;
let refreshTokenHash;

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

test("Logs in successfully and stores the refresh token hash", async () => {
  testUser = await createUserService({
    name: "Login Test User",
    email: testEmail,
    password: testPassword,
  });

  const response = await loginUserService({
    email: testEmail,
    password: testPassword,
  });

  assert.equal(typeof response.token, "string");
  assert.equal(typeof response.refreshToken, "string");
  assert.equal(response.user.id, testUser.id);

  refreshTokenHash = hashRefreshToken(response.refreshToken);

  const storedToken = await findRefreshTokenByHash(
    refreshTokenHash
  );

  assert.ok(storedToken);
  assert.equal(storedToken.userId, testUser.id);
  assert.equal(storedToken.tokenHash, refreshTokenHash);
  assert.notEqual(storedToken.tokenHash, response.refreshToken);
  assert.ok(storedToken.expiresAt instanceof Date);
  assert.equal(storedToken.revokedAt, null);
});

test("Rejects an incorrect password", async () => {
  await assert.rejects(
    loginUserService({
      email: testEmail,
      password: "WrongPassword123!",
    }),
    (error) => {
      assert.equal(error.statusCode, 401);
      assert.equal(
        error.message,
        "Email or password is incorrect"
      );
      return true;
    }
  );
});

test("Rejects a nonexistent user", async () => {
  await assert.rejects(
    loginUserService({
      email: "nonexistent-login-test@example.com",
      password: testPassword,
    }),
    (error) => {
      assert.equal(error.statusCode, 401);
      assert.equal(
        error.message,
        "Email or password is incorrect"
      );
      return true;
    }
  );
});

test("Rejects an inactive user", async () => {
  await prisma.user.update({
    where: { id: testUser.id },
    data: { isActive: false },
  });

  await assert.rejects(
    loginUserService({
      email: testEmail,
      password: testPassword,
    }),
    (error) => {
      assert.equal(error.statusCode, 401);
      assert.equal(
        error.message,
        "Email or password is incorrect"
      );
      return true;
    }
  );
});
