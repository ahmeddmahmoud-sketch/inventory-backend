
import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

import app from "../app.js";
import prisma from "../config/prisma.js";
import { createUserService } from "../services/user.service.js";

let server;
let baseUrl;
let testUser;

const testEmail = `refresh-http-${Date.now()}@example.com`;
const testPassword = "TestPassword123!";

before(async () => {
  testUser = await createUserService({
    name: "Refresh HTTP Test User",
    email: testEmail,
    password: testPassword,
  });

  server = createServer(app);

  await new Promise((resolve, reject) => {
    server.once("error", reject);

    server.listen(0, "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve();
    });
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

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

async function postJson(path, body) {
  return await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

test("Login returns access and refresh tokens", async () => {
  const response = await postJson("/api/v1/users/login", {
    email: testEmail,
    password: testPassword,
  });

  assert.equal(response.status, 200);

  const body = await response.json();

  assert.equal(body.status, "success");
  assert.equal(typeof body.token, "string");
  assert.equal(typeof body.refreshToken, "string");
  assert.equal(body.user.id, testUser.id);
});

test("Refresh endpoint rotates tokens and rejects reuse", async () => {
  const loginResponse = await postJson("/api/v1/users/login", {
    email: testEmail,
    password: testPassword,
  });

  assert.equal(loginResponse.status, 200);

  const login = await loginResponse.json();

  const refreshResponse = await postJson(
    "/api/v1/users/refresh",
    { refreshToken: login.refreshToken }
  );

  assert.equal(refreshResponse.status, 200);

  const refreshed = await refreshResponse.json();

  assert.equal(refreshed.status, "success");
  assert.equal(typeof refreshed.token, "string");
  assert.equal(typeof refreshed.refreshToken, "string");
  assert.notEqual(refreshed.refreshToken, login.refreshToken);

  const reuseResponse = await postJson(
    "/api/v1/users/refresh",
    { refreshToken: login.refreshToken }
  );

  assert.equal(reuseResponse.status, 401);
});

test("Refresh endpoint rejects a missing token", async () => {
  const response = await postJson(
    "/api/v1/users/refresh",
    {}
  );

  assert.equal(response.status, 401);
});

test("Unknown routes return 404", async () => {
  const response = await postJson(
    "/api/v1/users/route-that-does-not-exist",
    {}
  );

  assert.equal(response.status, 404);
});
