import bcrypt from "bcrypt";
import { Prisma } from "../../generated/prisma/client.js";
import AppError from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt.js";
import { createRefreshTokenService } from "./refreshToken.service.js";

import {
  findUserByEmail,
  createUser,
} from "../repositories/user.repository.js";

export async function createUserService(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("Invalid request data", 400);
  }

  const name =
    typeof data.name === "string" ? data.name.trim() : "";

  const email =
    typeof data.email === "string"
      ? data.email.trim().toLowerCase()
      : "";

  const password = data.password;

  if (!name || name.length > 100) {
    throw new AppError("Name is required and must not exceed 100 characters", 400);
  }

  if (!email || email.length > 255) {
    throw new AppError("Valid email is required", 400);
  }

  if (typeof password !== "string" || password.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    return await createUser({
      name,
      email,
      passwordHash,
      role: "EMPLOYEE",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("Email already exists", 409);
    }

    throw error;
  }
}




export async function loginUserService(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("Data must be valid", 400);
  }

  const email =
    typeof data.email === "string"
      ? data.email.trim().toLowerCase()
      : "";

  const password =
    typeof data.password === "string"
      ? data.password
      : "";

  if (!email || !password) {
    throw new AppError("Email or password is incorrect", 401);
  }

  const user = await findUserByEmail(email);

  if (!user || !user.isActive) {
    throw new AppError("Email or password is incorrect", 401);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new AppError("Email or password is incorrect", 401);
  }

  const token = jwt.sign(
    { role: user.role },
    JWT_SECRET,
    {
      subject: user.id,
      expiresIn: JWT_EXPIRES_IN,
    }
  );

  const refreshToken = await createRefreshTokenService(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
    refreshToken: refreshToken.token,
  };
}
