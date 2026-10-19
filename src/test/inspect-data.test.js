
import test from "node:test";
import prisma from "../config/prisma.js";

test("Inspect existing business data", async () => {
  try {
    const [companies, warehouses, products] = await Promise.all([
      prisma.company.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.warehouse.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          sku: true,
          companyId: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

    console.log("\nCompanies:");
    console.table(companies);

    console.log("\nWarehouses:");
    console.table(warehouses);

    console.log("\nProducts:");
    console.table(products);
  } finally {
    await prisma.$disconnect();
  }
});
