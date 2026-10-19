
import { body, param } from "express-validator";

export const createWarehouseValidation = [
  body("name")
    .exists({ values: "undefined" })
    .withMessage("Warehouse name is required")
    .bail()
    .isString()
    .withMessage("Warehouse name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Warehouse name cannot be empty")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Warehouse name must not exceed 100 characters"),
];

export const updateWarehouseValidation = [
  body("name")
    .exists({ values: "undefined" })
    .withMessage("Warehouse name is required")
    .bail()
    .isString()
    .withMessage("Warehouse name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Warehouse name cannot be empty")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Warehouse name must not exceed 100 characters"),

  body().custom((value) => {
    if (!value || Object.keys(value).length === 0) {
      throw new Error("Provide at least one field to update");
    }

    if (!Object.hasOwn(value, "name")) {
      throw new Error("No allowed fields provided for update");
    }

    const unsupportedFields = Object.keys(value).filter(
      (key) => key !== "name"
    );

    if (unsupportedFields.length > 0) {
      throw new Error("Unsupported update fields");
    }

    return true;
  }),
];

export const warehouseIdValidation = [
  param("id")
    .isUUID()
    .withMessage("Warehouse ID must be a valid UUID"),
];
