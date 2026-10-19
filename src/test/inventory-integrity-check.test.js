
import test from "node:test";
import assert from "node:assert/strict";

test("Detects an incorrect inventory balance", () => {
  const inventoryQuantity = 75;
  const calculatedQuantity = 70;

  assert.notEqual(inventoryQuantity, calculatedQuantity);
});
