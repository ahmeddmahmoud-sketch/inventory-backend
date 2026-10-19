
import { param } from "express-validator";

export const inventoryIdValidation = [
  param("id")
    .isUUID()
    .withMessage("Inventory ID must be a valid UUID"),
];
