import prisma from "../config/prisma.js";


export async function create(data) {
       const warehouse = await prisma.warehouse.create({
        data: {
            name: data.name
       }})

       return warehouse

}


export async function findAll() {
    const warehouses = await prisma.warehouse.findMany({
        where:{isDeleted:false}
    })
    return warehouses
}


export async function findById(id) {
  const warehouse = await prisma.warehouse.findFirst({
    where: {
      id: id,
      isDeleted: false,
    },
  });

  return warehouse;
}



export async function update(id, data) {
  const result = await prisma.warehouse.updateMany({
    where: {
      id,
      isDeleted: false,
    },
    data: {
      name: data.name,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return await prisma.warehouse.findUnique({
    where: { id },
  });
}

export async function deactivate(id) {
  const result = await prisma.warehouse.updateMany({
    where: {
      id,
      isDeleted: false,
    },
    data: {
      isDeleted: true,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return await prisma.warehouse.findUnique({
    where: { id },
  });
}
