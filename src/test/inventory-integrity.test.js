
import test from "node:test";
import assert from "node:assert/strict";
import prisma from "../config/prisma.js";

test("Inventory balances match stock movement totals", async () => {
  try {
    const inventoryRecords = await prisma.inventory.findMany();

    for (const inventory of inventoryRecords) {
      const movements = await prisma.stockMovement.findMany({
        where: {
          productId: inventory.productId,
          warehouseId: inventory.warehouseId,
        },
        select: {
          quantity: true,
        },
      });

      const calculatedQuantity = movements.reduce(
        (total, movement) => total + movement.quantity,
        0
      );

      assert.equal(
        inventory.quantity,
        calculatedQuantity,
        `Inventory mismatch for product ${inventory.productId} in warehouse ${inventory.warehouseId}. Expected ${calculatedQuantity}, got ${inventory.quantity}`
      );
    }
  } finally {
    await prisma.$disconnect();
  }
});
