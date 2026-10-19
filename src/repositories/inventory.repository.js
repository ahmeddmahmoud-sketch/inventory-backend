import prisma from "../config/prisma.js";





export async function findAll() {
  // Fetch all inventory records from the database
    const inventories = await prisma.inventory.findMany({
        where: {
            product: {
                status: "ACTIVE",
            },
            warehouse: {
                isDeleted: false,
            },
        },
        include: {
            product: true,
            warehouse: true,
        }
    });
    return inventories;
}


export async function findById(id) {
  const inventory = await prisma.inventory.findFirst({
    where: {
        id,
        product: {
            status: "ACTIVE",
        },
        warehouse: {
            isDeleted: false,
        },
    },
    include: {
      product: true,
      warehouse: true,
    },
  });

  return inventory;
}

export async function findByProductAndWarehouse(productId, warehouseId) {
  // Find inventory by productId and warehouseId
    const inventory = await prisma.inventory.findUnique({
        where: {
            productId_warehouseId: {
                productId,
                warehouseId
            }
        },
        include: {
            product: true,
            warehouse: true,
        }
    });
    return inventory;
}