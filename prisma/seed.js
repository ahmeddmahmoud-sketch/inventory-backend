
import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

// ============================================
// 1. Companies
// ============================================

const companies = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Company Alpha",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Company Beta",
  },
];

// ============================================
// 2. Users
// ============================================

const testPassword = "DevOnly123!";

const users = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "System Admin",
    email: "admin@example.com",
    role: "ADMIN",
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    name: "Inventory Manager",
    email: "manager@example.com",
    role: "MANAGER",
  },
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    name: "Inventory Employee",
    email: "employee@example.com",
    role: "EMPLOYEE",
  },
];

// ============================================
// 3. Warehouses
// ============================================

const warehouses = [
  {
    id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    name: "Main Warehouse",
  },
  {
    id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    name: "Secondary Warehouse",
  },
];

// ============================================
// 4. Products
// ============================================

const products = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Laptop",
    sku: "LAP-001",
    price: "25000.00",
    status: "ACTIVE",
    companyId: companies[0].id,
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Wireless Mouse",
    sku: "MOU-001",
    price: "450.00",
    status: "ACTIVE",
    companyId: companies[0].id,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "Keyboard",
    sku: "KEY-001",
    price: "850.00",
    status: "ACTIVE",
    companyId: companies[1].id,
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    name: "Old Monitor",
    sku: "MON-001",
    price: "3200.00",
    status: "INACTIVE",
    companyId: companies[1].id,
  },
];

// ============================================
// 5. Inventory
// Quantities represent final balances.
// ============================================

const inventoryRecords = [
  {
    id: "50000000-0000-4000-8000-000000000001",
    productId: products[0].id,
    warehouseId: warehouses[0].id,
    quantity: 75,
  },
  {
    id: "50000000-0000-4000-8000-000000000002",
    productId: products[1].id,
    warehouseId: warehouses[0].id,
    quantity: 40,
  },
  {
    id: "50000000-0000-4000-8000-000000000003",
    productId: products[2].id,
    warehouseId: warehouses[1].id,
    quantity: 30,
  },
  {
    id: "50000000-0000-4000-8000-000000000004",
    productId: products[0].id,
    warehouseId: warehouses[1].id,
    quantity: 25,
  },
];

// ============================================
// 6. Stock Movements
// ISSUE quantities are negative in the database.
// ============================================

const stockMovements = [
  {
    id: "60000000-0000-4000-8000-000000000001",
    productId: products[0].id,
    warehouseId: warehouses[0].id,
    type: "RECEIVE",
    quantity: 100,
    userId: users[1].id,
    createdAt: new Date("2026-10-01T09:00:00.000Z"),
  },
  {
    id: "60000000-0000-4000-8000-000000000002",
    productId: products[0].id,
    warehouseId: warehouses[0].id,
    type: "ISSUE",
    quantity: -20,
    userId: users[2].id,
    createdAt: new Date("2026-10-02T10:00:00.000Z"),
  },
  {
    id: "60000000-0000-4000-8000-000000000003",
    productId: products[0].id,
    warehouseId: warehouses[0].id,
    type: "ADJUST",
    quantity: -5,
    userId: users[1].id,
    createdAt: new Date("2026-10-03T11:00:00.000Z"),
  },
  {
    id: "60000000-0000-4000-8000-000000000004",
    productId: products[1].id,
    warehouseId: warehouses[0].id,
    type: "RECEIVE",
    quantity: 50,
    userId: users[1].id,
    createdAt: new Date("2026-10-04T09:00:00.000Z"),
  },
  {
    id: "60000000-0000-4000-8000-000000000005",
    productId: products[1].id,
    warehouseId: warehouses[0].id,
    type: "ISSUE",
    quantity: -10,
    userId: users[2].id,
    createdAt: new Date("2026-10-05T10:00:00.000Z"),
  },
  {
    id: "60000000-0000-4000-8000-000000000006",
    productId: products[2].id,
    warehouseId: warehouses[1].id,
    type: "RECEIVE",
    quantity: 30,
    userId: users[1].id,
    createdAt: new Date("2026-10-06T09:00:00.000Z"),
  },
  {
    id: "60000000-0000-4000-8000-000000000007",
    productId: products[0].id,
    warehouseId: warehouses[1].id,
    type: "RECEIVE",
    quantity: 30,
    userId: users[1].id,
    createdAt: new Date("2026-10-07T09:00:00.000Z"),
  },
  {
    id: "60000000-0000-4000-8000-000000000008",
    productId: products[0].id,
    warehouseId: warehouses[1].id,
    type: "ISSUE",
    quantity: -5,
    userId: users[2].id,
    createdAt: new Date("2026-10-08T10:00:00.000Z"),
  },
];

// ============================================
// Seed helpers
// ============================================

async function seedCompanies() {
  for (const company of companies) {
    await prisma.company.upsert({
      where: { id: company.id },
      update: {
        name: company.name,
        isDeleted: false,
      },
      create: company,
    });
  }

  console.log("Companies seeded successfully");
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash(testPassword, 10);

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        passwordHash,
        isActive: true,
      },
      create: {
        ...user,
        passwordHash,
      },
    });
  }

  console.log("Users seeded successfully");
}

async function seedWarehouses() {
  for (const warehouse of warehouses) {
    await prisma.warehouse.upsert({
      where: { id: warehouse.id },
      update: {
        name: warehouse.name,
        isDeleted: false,
      },
      create: warehouse,
    });
  }

  console.log("Warehouses seeded successfully");
}

async function seedProducts() {
  for (const product of products) {
    const { companyId, ...productData } = product;

    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        ...productData,
        company: {
          connect: { id: companyId },
        },
      },
      create: {
        ...productData,
        company: {
          connect: { id: companyId },
        },
      },
    });
  }

  console.log("Products seeded successfully");
}

async function seedInventory() {
  for (const record of inventoryRecords) {
    const { id, productId, warehouseId, quantity } = record;

    await prisma.inventory.upsert({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      update: {
        quantity,
      },
      create: {
        id,
        productId,
        warehouseId,
        quantity,
      },
    });
  }

  console.log("Inventory seeded successfully");
}

async function seedStockMovements() {
  for (const movement of stockMovements) {
    await prisma.stockMovement.upsert({
      where: { id: movement.id },
      update: {
        productId: movement.productId,
        warehouseId: movement.warehouseId,
        type: movement.type,
        quantity: movement.quantity,
        userId: movement.userId,
        createdAt: movement.createdAt,
      },
      create: movement,
    });
  }

  console.log("Stock movements seeded successfully");
}

// ============================================
// Main
// ============================================

async function main() {
  await seedCompanies();
  await seedUsers();
  await seedWarehouses();
  await seedProducts();
  await seedInventory();
  await seedStockMovements();

  console.log("All mock data seeded successfully");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
