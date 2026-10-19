import {body,param} from "express-validator";

const allowedUpdateFields = new Set(["name", "sku", "price"]);

const updateBodyValidation = body().custom(value => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Request body must be an object");
    }
    if (Object.keys(value).length === 0) {
        throw new Error("Provide at least one field to update");
    }
    const unsupportedFields = Object.keys(value).filter(field => !allowedUpdateFields.has(field));
    if (unsupportedFields.length) {
        throw new Error(`Unsupported field: ${unsupportedFields.join(", ")}`);
    }
    return true;
});


export const createProductValidation = [
body("name")
    .exists({ values: "undefined" })
    .withMessage("Product name is required")
    .bail()
    .isString()
    .withMessage("Product name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Product name must not exceed 100 characters"),

body("price")
    .exists({ values: "undefined" })
    .withMessage("Product price is required")
    .bail()
    .custom(value => typeof value === "number")
    .withMessage("Product price must be a number")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("Product price must be greater than zero"),

body("sku")
    .exists({ values: "undefined" })
    .withMessage("Product SKU is required")
    .bail()
    .isString()
    .withMessage("Product SKU must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Product SKU cannot be empty")
    .bail()
    .isLength({ max: 50 })
    .withMessage("Product SKU must not exceed 50 characters"),


body("companyId")
    .exists({ values: "undefined" })
    .withMessage("Company ID is required")
    .bail()
    .isUUID()
    .withMessage("Company ID must be a valid UUID")

]

export const ProductIdValidation = [
    param("id")
        .isUUID()
        .withMessage("Product ID must be a valid UUID")
];




export const updateProductValidation = [
    updateBodyValidation,
    body("name")
        .optional()
        .isString()
        .withMessage("Product name must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Product name cannot be empty")
        .bail()
        .isLength({ max: 100 })
        .withMessage("Product name must not exceed 100 characters"),

    body("price")
        .optional()
        .custom(value => typeof value === "number")
        .withMessage("Product price must be a number")
        .bail()
        .isFloat({ gt: 0 })
        .withMessage("Product price must be greater than zero"),

    body("sku")
        .optional()
        .isString()
        .withMessage("Product SKU must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Product SKU cannot be empty")
        .bail()
        .isLength({ max: 50 })
        .withMessage("Product SKU must not exceed 50 characters")
];
