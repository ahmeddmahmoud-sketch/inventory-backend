
    import {createCompany,getAllCompany , getCompanyById,updateCompany , deleteCompany} from "../services/company.service.js";


    export async function createCompanyController(req,res){
                const company = req.body

                const newCompany = await createCompany(company)

                return res.status(201).json({
                    status:"success",
                    newCompany
                })


    }


    export async function getAllCompaniesController(req,res) {
            const companies = await getAllCompany()

            return res.status(200).json({
                    status:"success",
                    companies
                })

        
    }


    export async function getCompanyByIdController(req,res){
            const companyId = req.params.id

            const company = await getCompanyById(companyId)


            return res.status(200).json({
                status:"success",
                company
            })
    


    }


    export async function updateCompanyController(req,res) {
            const companyId = req.params.id

            const updatedCompany = await updateCompany(companyId,req.body)

            return res.status(200).json({
                status:"success",
                msg:"company Updated Successfully",
                updatedCompany
            })
        
        
    }


    export async function deleteCompanyController(req,res){
            await deleteCompany(req.params.id)

            return res.status(200).json({
                status:"success",
                msg:"company deleted successfully"
            })
        }