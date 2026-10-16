
import prisma from "../config/prisma.js";
import companyRepository from "../repositories/company.repository.js";

try {
  // 1. أنشئ شركة باسم "Company A"
  const data ={name: "Company A"}
  // استدعِ companyRepository.create(...)
  const company = await companyRepository.create(data)

  // 2. اطبع الشركة الجديدة
  console.log(company);
  
  // 3. استدعِ companyRepository.findAll()
  const companies = await companyRepository.findAll()

  // 4. اطبع كل الشركات
  console.log(companies);

  const companyid = await companyRepository.findById("7a1ffe2f-5cbb-4eea-8b68-47b4c4bec37d")
  console.log("companyid:",companyid);
  
  
} catch (error) {
  console.error("Test failed:", error.message);
} finally {
  await prisma.$disconnect();
}
