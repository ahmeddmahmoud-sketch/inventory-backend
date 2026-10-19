
import express from "express";
import {
  createUserController,
  loginUserController,
  refreshTokenController,
} from "../controller/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post("/login", loginUserController);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createUserController
);

router.post("/refresh", refreshTokenController);

export default router;
