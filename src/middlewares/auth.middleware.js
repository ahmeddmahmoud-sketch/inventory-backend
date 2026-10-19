import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";
import AppError from "../utils/AppError.js";
import { findUserById } from "../repositories/user.repository.js";

export default async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;

  // 1. Check Authorization header
  if (
    typeof authorization !== "string" ||
    !authorization.startsWith("Bearer ")
  ) {
    return next(
      new AppError("Authentication required", 401)
    );
  }

  // 2. Extract token
  const token = authorization.slice(7).trim();

  if (!token) {
    return next(
      new AppError("Authentication required", 401)
    );
  }

  // 3. Verify JWT
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      typeof payload.role !== "string"
    ) {
      throw new Error("Invalid token payload");
    }
  } catch {
    return next(
      new AppError("Invalid or expired token", 401)
    );
  }

  // 4. Fetch current user from database
  const user = await findUserById(payload.sub);

  // 5. Reject missing or inactive users
  if (!user || !user.isActive) {
    return next(
      new AppError("Invalid or inactive user", 401)
    );
  }

  // 6. Attach current user data to request
  req.user = {
    id: user.id,
    role: user.role,
  };

  // 7. Continue to the next middleware/controller
  return next();
}
