import express from "express";
import {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    updateProductController,
    deactivateProductController,
    reactivateProductController
} from "../controller/product.controller.js";

import { 
    createProductValidation,
    ProductIdValidation,
    updateProductValidation
 } from "../validations/product.validation.js";
import validateMiddleware from "../middlewares/validate.middleware.js";

const router = express.Router();

router.post(
    "/",
    createProductValidation,
    validateMiddleware,
    createProductController
);

router.get("/", getAllProductsController);



router.get("/:id", 
    ProductIdValidation,
    validateMiddleware,
    getProductByIdController
);

router.patch(
    "/:id",
    ProductIdValidation,
    updateProductValidation,
    validateMiddleware,
    updateProductController
);

router.patch(
    "/:id/deactivate",
    ProductIdValidation,
    validateMiddleware,
    deactivateProductController
);

router.patch(
    "/:id/reactivate",
    ProductIdValidation,
    validateMiddleware,
    reactivateProductController
);






export default router;
