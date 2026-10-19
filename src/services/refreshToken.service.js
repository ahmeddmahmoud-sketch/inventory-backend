import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN_DAYS,
} from "../config/jwt.js";



import AppError from "../utils/AppError.js";    

import {
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/refreshToken.js";

import {
  createRefreshToken,
  findRefreshTokenByHash,
  consumeRefreshToken,
} from "../repositories/refreshToken.repository.js";

// Create and store a new refresh token during login.
export async function createRefreshTokenService(userId) {
  const token = generateRefreshToken();
  const tokenHash = hashRefreshToken(token);

  const expiresAt = new Date(
    Date.now() +
      REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
  );

  await createRefreshToken({
    userId,
    tokenHash,
    expiresAt,
  });

  return {
    token,
    expiresAt,
  };
}

// Exchange an existing refresh token for new tokens.
export async function refreshAccessTokenService(rawToken) {
  if (typeof rawToken !== "string" || !rawToken.trim()) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const tokenHash = hashRefreshToken(rawToken);

  return await prisma.$transaction(async (tx) => {
    const storedToken = await findRefreshTokenByHash(
      tokenHash,
      tx
    );

    const now = new Date();

    if (
      !storedToken ||
      storedToken.revokedAt !== null ||
      storedToken.expiresAt <= now
    ) {
      throw new AppError(
        "Invalid or expired refresh token",
        401
      );
    }

    const user = await tx.user.findUnique({
      where: { id: storedToken.userId },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError(
        "Invalid or expired refresh token",
        401
      );
    }

    // Atomically invalidate the old token.
    const consumed = await consumeRefreshToken(
      storedToken.id,
      now,
      tx
    );

    if (consumed.count !== 1) {
      throw new AppError(
        "Invalid or expired refresh token",
        401
      );
    }

    // Generate the replacement refresh token.
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash =
      hashRefreshToken(newRefreshToken);

    const expiresAt = new Date(
      Date.now() +
        REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
    );

    await createRefreshToken(
      {
        userId: user.id,
        tokenHash: newRefreshTokenHash,
        expiresAt,
      },
      tx
    );

    // Sign a fresh access token using the current DB role.
    const accessToken = jwtSignAccessToken(user);

    return {
      token: accessToken,
      refreshToken: newRefreshToken,
    };
  });
}

function jwtSignAccessToken(user) {
  // Importing the JWT library at the top keeps dependencies explicit.
  return jwt.sign(
    { role: user.role },
    JWT_SECRET,
    {
      subject: user.id,
      expiresIn: JWT_EXPIRES_IN,
    }
  );
}
