
import prisma from "../config/prisma.js";

console.log("Prisma client keys:", Object.keys(prisma));
console.log("Company model:", prisma.company);

await prisma.$disconnect();
