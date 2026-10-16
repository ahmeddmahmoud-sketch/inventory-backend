import { body } from "express-validator";

export const createCompanyValidation =[
        body("name")
        .exists({ values: "undefined" })
        .withMessage("Company name is required")
        .bail()
        .isString()
        .withMessage("Company name must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Company name cannot be empty")
        .isLength({ max: 100 })
        .withMessage("Company name must not exceed 100 characters")
]





export const updateCompanyValidation = [
    body("name")
        .optional()
        .isString()
        .withMessage("Company name must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Company name cannot be empty")
        .bail()
        .isLength({ max: 100 })
        .withMessage("Company name must not exceed 100 characters"),

    body().custom((value) => {
        if (!value || Object.keys(value).length === 0) {
            throw new Error("Provide at least one field to update");
        }

        if (!Object.hasOwn(value, "name")) {
            throw new Error("No allowed fields provided for update");
        }

        return true;
    })
];
