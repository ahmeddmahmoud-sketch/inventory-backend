import express from 'express'
import {
    createCompanyController,
    getAllCompaniesController,
    getCompanyByIdController,
    updateCompanyController,
    deleteCompanyController
} from '../controller/company.controller.js'

import { createCompanyValidation , updateCompanyValidation} from "../validations/company.validation.js";
import validateMiddleware from "../middlewares/validate.middleware.js";

const router = express.Router()


router.post(
    "/",
    createCompanyValidation,
    validateMiddleware,
    createCompanyController
)
router.get("/",getAllCompaniesController)
router.get("/:id",getCompanyByIdController)

router.patch(
    "/:id",
    updateCompanyValidation,
    validateMiddleware,
    updateCompanyController
)

router.delete("/:id",deleteCompanyController)


export default router