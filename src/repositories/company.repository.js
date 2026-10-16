
import prisma from "../config/prisma.js";

async function create(data) {
  // TODO: استخدم Prisma لإنشاء Company
  // استقبل اسم الشركة من data.name
  const company = await prisma.company.create({
  data: {
    name: data.name,
  },
});
  return company

}

async function findAll() {
  // TODO: رجّع كل الشركات من قاعدة البيانات

  const companies = await prisma.company.findMany({
    where:{isDeleted:false}
  })
  return companies
}

async function findById(companyId) {
    const company = await prisma.company.findFirst({
        where:{
            id:companyId,
            isDeleted:false
            
        }
    })

    return company

    
}

async function update(companyId, data) {
  const company = await prisma.company.update({
    where: { id: companyId },
    data: { name: data.name },
  });

  return company;
}


async function softDelete(companyId) {

  const company = await prisma.company.update({
    where:{
      id:companyId
    },
    data:{
      isDeleted:true
    }
  })

  return company
  
}

export default {
  create,
  findAll,
  findById,
  update,
  softDelete
};
