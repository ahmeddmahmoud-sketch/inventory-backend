
import test, { after } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import prisma from "../config/prisma.js";
import { JWT_SECRET } from "../config/jwt.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { createUserService } from "../services/user.service.js";

const testEmail = `auth-middleware-${Date.now()}@example.com`;
const testPassword = "TestPassword123!";

let testUser;
let token;

after(async () => {
  if (testUser?.id) {
    await prisma.user.deleteMany({
      where: { id: testUser.id },
    });
  }

  await prisma.$disconnect();
});

test("Allows an active user and rejects the same token after deactivation", async () => {
  testUser = await createUserService({
    name: "Auth Middleware Test",
    email: testEmail,
    password: testPassword,
  });

  token = jwt.sign(
    { role: testUser.role },
    JWT_SECRET,
    { subject: testUser.id, expiresIn: "15m" }
  );

  const makeRequest = () => ({
    headers: { authorization: `Bearer ${token}` },
  });

  const activeReq = makeRequest();

  let activeError;
  let activeNextCalled = false;

  await authMiddleware(activeReq, {}, (err) => {
    activeError = err;
    if (!err) activeNextCalled = true;
  });

  assert.equal(activeError, undefined);
  assert.equal(activeNextCalled, true);
  assert.equal(activeReq.user.id, testUser.id);

  await prisma.user.update({
    where: { id: testUser.id },
    data: { isActive: false },
  });

  const inactiveReq = makeRequest();

  let inactiveError;
  let inactiveNextCalled = false;

  await authMiddleware(inactiveReq, {}, (err) => {
    inactiveError = err;
    if (!err) inactiveNextCalled = true;
  });

  assert.equal(inactiveNextCalled, false);
  assert.equal(inactiveError?.statusCode, 401);
  assert.equal(inactiveError?.message, "Invalid or inactive user");
});
