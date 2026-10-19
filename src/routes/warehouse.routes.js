
import express from "express";

import {
  createWarehouseController,
  getAllWarehousesController,
  getWarehouseByIdController,
  updateWarehouseController,
  deactivateWarehouseController,
} from "../controller/warehouse.controller.js";

import {
  createWarehouseValidation,
  updateWarehouseValidation,
  warehouseIdValidation,
} from "../validations/warehouse.validation.js";

import validateMiddleware from "../middlewares/validate.middleware.js";

const router = express.Router();

router.post(
  "/",
  createWarehouseValidation,
  validateMiddleware,
  createWarehouseController
);

router.get("/", getAllWarehousesController);

router.get(
  "/:id",
  warehouseIdValidation,
  validateMiddleware,
  getWarehouseByIdController
);

router.patch(
  "/:id",
  warehouseIdValidation,
  updateWarehouseValidation,
  validateMiddleware,
  updateWarehouseController
);

router.patch(
  "/:id/deactivate",
  warehouseIdValidation,
  validateMiddleware,
  deactivateWarehouseController
);

export default router;
