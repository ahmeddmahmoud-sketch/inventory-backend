import express from 'express';
import { getAllInventoryController,getInventoryByIdController} from '../controller/inventory.controller.js';

import { inventoryIdValidation } from '../validations/inventory.validation.js';
import validateMiddleware from '../middlewares/validate.middleware.js';

const router = express.Router();

router.get('/', getAllInventoryController);


router.get(
  '/:id',
  inventoryIdValidation,
  validateMiddleware,
  getInventoryByIdController
);


export default router;