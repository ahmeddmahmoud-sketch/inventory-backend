
import test, { after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { createUserService } from "../services/user.service.js";


after(async () => {
  await prisma.$disconnect();
});

test("Creates a user securely", async () => {
  const email = `user-${Date.now()}@example.com`;
  const password = "DevOnly123!";

  try {
    const user = await createUserService({
      name: " Test User ",
      email: ` ${email.toUpperCase()} `,
      password,
    });

    assert.equal(user.name, "Test User");
    assert.equal(user.email, email);
    assert.equal(user.role, "EMPLOYEE");
    assert.equal(user.isActive, true);

    assert.equal("passwordHash" in user, false);
    assert.equal("password" in user, false);

    const storedUser = await prisma.user.findUnique({
      where: { email },
    });

    assert.ok(storedUser);
    assert.notEqual(storedUser.passwordHash, password);

    const passwordMatches = await bcrypt.compare(
      password,
      storedUser.passwordHash
    );

    assert.equal(passwordMatches, true);
  } finally {
    await prisma.user.deleteMany({
      where: { email },
    });

  }
});


test("Rejects duplicate email with 409 Conflict", async () => {
  const email = `duplicate-${Date.now()}@example.com`;

  try {
    await createUserService({
      name: "First User",
      email,
      password: "DevOnly123!",
    });

    await assert.rejects(
      createUserService({
        name: "Second User",
        email,
        password: "DevOnly123!",
      }),
      {
        message: "Email already exists",
        statusCode: 409,
      }
    );

    const count = await prisma.user.count({
      where: { email },
    });

    assert.equal(count, 1);
  } finally {
    await prisma.user.deleteMany({
      where: { email },
    });

  }
});



