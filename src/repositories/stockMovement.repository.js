import AppError from "../utils/AppError.js";


export async function createStockMovement(tx, data) {
  const movement = await tx.stockMovement.create({
    data: {
      productId: data.productId,
      warehouseId: data.warehouseId,
      type: data.type,
      quantity: data.quantity,
      userId: data.userId,
    },
  });

  return movement;
}


export async function updateInventoryQuantity(tx,productId,warehouseId,delta) {
  if (delta < 0) {
    const result = await tx.inventory.updateMany({
      where: {
        productId,
        warehouseId,
        quantity: {
          gte: Math.abs(delta),
        },
      },
      data: {
        quantity: {
          decrement: Math.abs(delta),
        },
      },
    });

    if (result.count === 0) {
        throw new AppError(
            "Insufficient stock or inventory record not found",
            400
        );
    }
  } else {
    await tx.inventory.upsert({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      create: {
        productId,
        warehouseId,
        quantity: delta,
      },
      update: {
        quantity: {
          increment: delta,
        },
      },
    });
  }

  return await tx.inventory.findUnique({
    where: {
      productId_warehouseId: {
        productId,
        warehouseId,
      },
    },
  });
}


export async function findActiveProduct(tx, productId) {
  return await tx.product.findFirst({
    where: {
      id: productId,
      status: "ACTIVE",
    },
  });
}

export async function findActiveWarehouse(tx, warehouseId) {
  return await tx.warehouse.findFirst({
    where: {
      id: warehouseId,
      isDeleted: false,
    },
  });
}

export async function findActiveUser(tx, userId) {
  return await tx.user.findFirst({
    where: {
      id: userId,
      isActive: true,
    },
  });
}






export async function findAllStockMovements(tx, page, limit, filters = {}) {
  const skip = (page - 1) * limit;

  const where = {};

  if (filters.productId) {
    where.productId = filters.productId;
  }

  if (filters.warehouseId) {
    where.warehouseId = filters.warehouseId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.createdAt) {
  where.createdAt = filters.createdAt;
  }

  const [movements, total] = await Promise.all([
    tx.stockMovement.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
      include: {
        product: true,
        warehouse: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),

    tx.stockMovement.count({ where }),
  ]);

  return { movements, total };
}



export async function findStockMovementById(tx, id) {
  return await tx.stockMovement.findUnique({
    where: {
      id,
    },
    include: {
      product: true,
      warehouse: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}
