
import test from "node:test";
import assert from "node:assert/strict";
import { createUserService } from "../services/user.service.js";

test("Rejects invalid request data", async () => {
  await assert.rejects(
    createUserService(null),
    {
      message: "Invalid request data",
      statusCode: 400,
    }
  );
});

test("Rejects empty name", async () => {
  await assert.rejects(
    createUserService({
      name: "   ",
      email: "test@example.com",
      password: "DevOnly123!",
    }),
    {
      message: "Name is required and must not exceed 100 characters",
      statusCode: 400,
    }
  );
});

test("Rejects short password", async () => {
  await assert.rejects(
    createUserService({
      name: "Test User",
      email: "test@example.com",
      password: "123",
    }),
    {
      message: "Password must be at least 8 characters",
      statusCode: 400,
    }
  );
});
