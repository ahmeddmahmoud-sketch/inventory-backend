import prisma from "../config/prisma.js";

export async function findUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email },
  });
}



export async function findUserById(id) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}




export async function createUser(data) {
  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
