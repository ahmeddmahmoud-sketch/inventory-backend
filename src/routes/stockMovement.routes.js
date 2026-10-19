
import express from "express";

import {
  createStockMovementController,
  getAllStockMovementsController,
  getStockMovementByIdController,
} from "../controller/stockMovement.controller.js";

import {
  createStockMovementValidation,
  stockMovementIdValidation,
  stockMovementQueryValidation,
} from "../validations/stockMovement.validation.js";

import validateMiddleware  from "../middlewares/validate.middleware.js";

const router = express.Router();


router.post(
  "/",
  createStockMovementValidation,
  validateMiddleware,
  createStockMovementController
);

router.get(
  "/",
  stockMovementQueryValidation,
  validateMiddleware,
  getAllStockMovementsController
);

router.get(
  "/:id",
  stockMovementIdValidation,
  validateMiddleware,
  getStockMovementByIdController
);


export default router;
