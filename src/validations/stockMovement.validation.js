
import { body, param, query } from "express-validator";

const movementTypes = ["RECEIVE", "ISSUE", "ADJUST"];


function isRealDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}


export const createStockMovementValidation = [
  body().custom((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Invalid request data");
    }

    const allowedFields = [
      "productId",
      "warehouseId",
      "type",
      "quantity",
      "userId",
    ];

    const unsupportedFields = Object.keys(value).filter(
      (key) => !allowedFields.includes(key)
    );

    if (unsupportedFields.length > 0) {
      throw new Error("Unsupported fields in request body");
    }

    return true;
  }),

  body("productId")
    .isUUID()
    .withMessage("Product ID must be a valid UUID"),

  body("warehouseId")
    .isUUID()
    .withMessage("Warehouse ID must be a valid UUID"),

  body("userId")
    .isUUID()
    .withMessage("User ID must be a valid UUID"),

  body("type")
    .isIn(movementTypes)
    .withMessage("Invalid movement type"),


body("quantity")
  .isInt({ min: -2147483648, max: 2147483647 })
  .withMessage("Quantity must be a valid 32-bit integer")
  .toInt()
  .custom((quantity, { req }) => {
    if (quantity === 0) {
      throw new Error("Quantity must not be zero");
    }

    if (
      ["RECEIVE", "ISSUE"].includes(req.body.type) &&
      quantity < 0
    ) {
      throw new Error(`${req.body.type} quantity must be positive`);
    }

    return true;
  }),

];

export const stockMovementIdValidation = [
  param("id")
    .isUUID()
    .withMessage("Stock movement ID must be a valid UUID"),
];

export const stockMovementQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be an integer between 1 and 100")
    .toInt(),

  query("productId")
    .optional()
    .isUUID()
    .withMessage("Product ID filter must be a valid UUID"),

  query("warehouseId")
    .optional()
    .isUUID()
    .withMessage("Warehouse ID filter must be a valid UUID"),

  query("type")
    .optional()
    .isIn(movementTypes)
    .withMessage("Invalid movement type filter"),



  query("from")
    .optional()
    .custom(isRealDate)
    .withMessage("from must be a valid date in YYYY-MM-DD format"),

  query("to")
    .optional()
    .custom(isRealDate)
    .withMessage("to must be a valid date in YYYY-MM-DD format"),

];
