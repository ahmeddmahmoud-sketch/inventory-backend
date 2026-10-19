
// import test from "node:test";
// import assert from "node:assert/strict";
// import prisma from "../config/prisma.js";

// test("Seed data has expected record counts", async () => {
//   try {
//     const [
//       companies,
//       users,
//       warehouses,
//       products,
//       inventory,
//       movements,
//     ] = await Promise.all([
//       prisma.company.count(),
//       prisma.user.count(),
//       prisma.warehouse.count(),
//       prisma.product.count(),
//       prisma.inventory.count(),
//       prisma.stockMovement.count(),
//     ]);

//     assert.equal(companies, 2);
//     assert.equal(users, 3);
//     assert.equal(warehouses, 2);
//     assert.equal(products, 4);
//     assert.equal(inventory, 4);
//     assert.equal(movements, 8);
//   } finally {
//     await prisma.$disconnect();
//   }
// });



import test from "node:test";
import prisma from "../config/prisma.js";

test("Inspect current database record counts", async () => {
  try {
    const counts = await Promise.all([
      prisma.company.count(),
      prisma.user.count(),
      prisma.warehouse.count(),
      prisma.product.count(),
      prisma.inventory.count(),
      prisma.stockMovement.count(),
    ]);

    console.table([
      { table: "Company", count: counts[0] },
      { table: "User", count: counts[1] },
      { table: "Warehouse", count: counts[2] },
      { table: "Product", count: counts[3] },
      { table: "Inventory", count: counts[4] },
      { table: "StockMovement", count: counts[5] },
    ]);
  } finally {
    await prisma.$disconnect();
  }
});
