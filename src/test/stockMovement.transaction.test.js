
import test from "node:test";
import assert from "node:assert/strict";
import prisma from "../config/prisma.js";
import { createStockMovement } from "../services/stockMovement.service.js";

test("Rejects issue greater than available stock without changing data", async () => {
  const productId = "10000000-0000-4000-8000-000000000001";
  const warehouseId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
  const userId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

  try {
    const inventoryBefore = await prisma.inventory.findUniqueOrThrow({
      where: {
        productId_warehouseId: { productId, warehouseId },
      },
    });

    const movementsBefore = await prisma.stockMovement.count({
      where: { productId, warehouseId },
    });

    await assert.rejects(
      createStockMovement({
        productId,
        warehouseId,
        userId,
        type: "ISSUE",
        quantity: inventoryBefore.quantity + 25,
      }),
      {
        message: "Insufficient stock or inventory record not found",
        statusCode: 400,
      }
    );

    const inventoryAfter = await prisma.inventory.findUniqueOrThrow({
      where: {
        productId_warehouseId: { productId, warehouseId },
      },
    });

    const movementsAfter = await prisma.stockMovement.count({
      where: { productId, warehouseId },
    });

    assert.equal(inventoryAfter.quantity, inventoryBefore.quantity);
    assert.equal(movementsAfter, movementsBefore);
  } finally {
    await prisma.$disconnect();
  }
});





test("ISSUE decreases stock and stores a negative movement quantity", async () => {
  const productId = "10000000-0000-4000-8000-000000000001";
  const warehouseId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
  const userId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

  try {
    const before = await prisma.inventory.findUniqueOrThrow({
      where: {
        productId_warehouseId: { productId, warehouseId },
      },
    });

    const result = await createStockMovement({
      productId,
      warehouseId,
      userId,
      type: "ISSUE",
      quantity: 1,
    });

    assert.equal(result.inventory.quantity, before.quantity - 1);
    assert.equal(result.movement.quantity, -1);
    assert.equal(result.movement.type, "ISSUE");

    await createStockMovement({
      productId,
      warehouseId,
      userId,
      type: "RECEIVE",
      quantity: 1,
    });

    const after = await prisma.inventory.findUniqueOrThrow({
      where: {
        productId_warehouseId: { productId, warehouseId },
      },
    });

    assert.equal(after.quantity, before.quantity);
  } finally {
    await prisma.$disconnect();
  }
});



test("Database transaction rolls back inventory changes after an error", async () => {
  const productId = "10000000-0000-4000-8000-000000000001";
  const warehouseId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

  try {
    const before = await prisma.inventory.findUniqueOrThrow({
      where: {
        productId_warehouseId: { productId, warehouseId },
      },
    });

    await assert.rejects(
      prisma.$transaction(async (tx) => {
        await tx.inventory.update({
          where: {
            productId_warehouseId: { productId, warehouseId },
          },
          data: {
            quantity: { decrement: 1 },
          },
        });

        throw new Error("Simulated failure");
      }),
      { message: "Simulated failure" }
    );

    const after = await prisma.inventory.findUniqueOrThrow({
      where: {
        productId_warehouseId: { productId, warehouseId },
      },
    });

    assert.equal(after.quantity, before.quantity);
  } finally {
    await prisma.$disconnect();
  }
});
