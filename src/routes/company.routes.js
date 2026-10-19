import express from 'express'
import {
    createCompanyController,
    getAllCompaniesController,
    getCompanyByIdController,
    updateCompanyController,
    deleteCompanyController
} from '../controller/company.controller.js'

import { 
    createCompanyValidation , 
    updateCompanyValidation,
    companyIdValidation
} 
    from "../validations/company.validation.js";
import validateMiddleware from "../middlewares/validate.middleware.js";

const router = express.Router()


router.post(
    "/",
    createCompanyValidation,
    validateMiddleware,
    createCompanyController
)
router.get(
    "/",
    getAllCompaniesController)


router.get(
    "/:id",
    companyIdValidation,
    validateMiddleware,
    getCompanyByIdController)

router.patch(
    "/:id",
    companyIdValidation,
    updateCompanyValidation,
    validateMiddleware,
    updateCompanyController
);

router.delete(
    "/:id",
    companyIdValidation,
    validateMiddleware,
    deleteCompanyController
);


export default router