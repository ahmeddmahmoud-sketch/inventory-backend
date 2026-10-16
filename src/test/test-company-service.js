
import prisma from "../config/prisma.js";
import {createCompany} from "../services/company.service.js";

try {
    const data = { name: "   " };

    const company = await createCompany(data)

    console.log(company);
    
  
  
} catch (error) {
  console.error("Test failed:", error.message);
} finally {
  await prisma.$disconnect();
}
