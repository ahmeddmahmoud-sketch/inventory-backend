import companyRepository from "../repositories/company.repository.js"
import AppError from "../utils/AppError.js";

export async function createCompany(data){
    if(!data.name || !data.name.trim()){
        throw new AppError("Data Must be valid",400);        
    }
    const cleanedData = {
    name: data.name.trim()
};

    const company = await companyRepository.create(cleanedData)

    return company


}


export async function getAllCompany() {

    return await companyRepository.findAll()
    
}


export async function getCompanyById(companyId){
    const company = await companyRepository.findById(companyId)

    if(!company){
        throw new AppError("there is no company with this ID",404)
    }

    return company
}



export async function updateCompany(companyId, data) {
    const validCompany = await companyRepository.findById(companyId);

    if (!validCompany) {
        throw new AppError("There is no company with this ID", 404);
    }

    const cleanedData = {};

    if (data.name !== undefined) {
        if (typeof data.name !== "string" || !data.name.trim()) {
            throw new AppError("Company name must be a non-empty string", 400);
        }

        cleanedData.name = data.name.trim();
    }

    if (Object.keys(cleanedData).length === 0) {
        throw new AppError("Provide at least one valid field to update", 400);
    }

    return await companyRepository.update(companyId, cleanedData);
}




export async function deleteCompany(companyId) {
    const validCompany = await companyRepository.findById(companyId)

    if(!validCompany){
        throw new AppError("there is no company with this ID",404)
    }

    const company = await companyRepository.softDelete(companyId)

    return company

    
}