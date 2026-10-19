
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";

import {
  createStockMovement as createStockMovementRecord,
  updateInventoryQuantity,
  findActiveProduct,
  findActiveWarehouse,
  findActiveUser,
  findAllStockMovements,
  findStockMovementById,
} from "../repositories/stockMovement.repository.js";

export async function createStockMovement(data) {
  // 1. Validate request data
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("Invalid request data", 400);
  }

  const { productId, warehouseId, type, quantity, userId } = data;

  if (!productId || !warehouseId || !userId) {
    throw new AppError(
      "Product, warehouse, and user are required",
      400
    );
  }

  // 2. Validate movement type
  const allowedTypes = ["RECEIVE", "ISSUE", "ADJUST"];

  if (!allowedTypes.includes(type)) {
    throw new AppError("Invalid movement type", 400);
  }

  // 3. Validate quantity
  if (
    typeof quantity !== "number" ||
    !Number.isSafeInteger(quantity) ||
    quantity === 0
  ) {
    throw new AppError(
      "Quantity must be a non-zero integer",
      400
    );
  }

  if (type === "RECEIVE" && quantity < 0) {
    throw new AppError("Receive quantity must be positive", 400);
  }


  if (type === "ISSUE" && quantity <= 0) {
    throw new AppError(
      "Issue quantity must be positive",
      400
    );
  }


  // ISSUE requests use a positive quantity,
  // but the stored movement quantity is negative.
  const delta = type === "ISSUE" ? -quantity : quantity;

  // 4. Update inventory and record movement atomically
  return await prisma.$transaction(async (tx) => {
    const product = await findActiveProduct(tx, productId);

    if (!product) {
      throw new AppError("Active product not found", 404);
    }

    const warehouse = await findActiveWarehouse(tx, warehouseId);

    if (!warehouse) {
      throw new AppError("Active warehouse not found", 404);
    }

    const user = await findActiveUser(tx, userId);

    if (!user) {
      throw new AppError("Active user not found", 404);
    }

    const inventory = await updateInventoryQuantity(
      tx,
      productId,
      warehouseId,
      delta
    );

    const movement = await createStockMovementRecord(tx, {
      productId,
      warehouseId,
      type,
      quantity: delta,
      userId,
    });

    return {
      movement,
      inventory,
    };
  });
}






export async function getAllStockMovements(query) {
  const page = Number(query?.page ?? 1);
  const limit = Number(query?.limit ?? 10);

  // 1. Validate pagination
  if (
    !Number.isSafeInteger(page) ||
    !Number.isSafeInteger(limit) ||
    page < 1 ||
    limit < 1 ||
    limit > 100
  ) {
    throw new AppError(
      "Page must be a positive integer and limit must be between 1 and 100",
      400
    );
  }

  // 2. Validate movement type
  const allowedTypes = ["RECEIVE", "ISSUE", "ADJUST"];

  const { productId, warehouseId, type, from, to } = query ?? {};

  if (type && !allowedTypes.includes(type)) {
    throw new AppError("Invalid movement type filter", 400);
  }

  // 3. Validate dates
  function parseDate(value, fieldName) {
    if (value === undefined) {
      return undefined;
    }

    if (
      typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      throw new AppError(
        `${fieldName} must use YYYY-MM-DD format`,
        400
      );
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new AppError(
        `${fieldName} is not a valid date`,
        400
      );
    }

    return date;
  }

  const fromDate = parseDate(from, "from");
  const toDate = parseDate(to, "to");

  if (fromDate && toDate && fromDate > toDate) {
    throw new AppError(
      "'from' must be before or equal to 'to'",
      400
    );
  }

  // 4. Build filters
  const filters = {
    ...(productId && { productId }),
    ...(warehouseId && { warehouseId }),
    ...(type && { type }),
  };

  if (fromDate || toDate) {
    filters.createdAt = {};

    if (fromDate) {
      filters.createdAt.gte = fromDate;
    }

    if (toDate) {
      const endExclusive = new Date(toDate);
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

      filters.createdAt.lt = endExclusive;
    }
  }

  // 5. Fetch movements with pagination
  const { movements, total } = await prisma.$transaction(
    async (tx) => {
      return findAllStockMovements(tx, page, limit, filters);
    }
  );

  // 6. Return data and pagination metadata
  return {
    movements,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}



export async function getStockMovementById(id) {
  const movement = await prisma.$transaction(async (tx) => {
    return findStockMovementById(tx, id);
  });

  if (!movement) {
    throw new AppError("Stock movement not found", 404);
  }

  return movement;
}
