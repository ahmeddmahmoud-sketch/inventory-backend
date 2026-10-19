
import test from "node:test";
import assert from "node:assert/strict";
import { createStockMovement } from "../services/stockMovement.service.js";

test("Rejects negative ISSUE quantity", async () => {
  await assert.rejects(
    createStockMovement({
      productId: "10000000-0000-4000-8000-000000000001",
      warehouseId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      userId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      type: "ISSUE",
      quantity: -10,
    }),
    {
      message: "Issue quantity must be positive",
      statusCode: 400,
    }
  );
});
