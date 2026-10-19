import prisma from "../config/prisma.js";


export async function create(data) {
    const product = await prisma.product.create({
        data: {
            name: data.name,
            sku: data.sku,
            price: data.price,
            companyId: data.companyId,

        },
    });
    return product;
}


export async function findAll() {
    const products = await prisma.product.findMany({
        where: {
            status: "ACTIVE", // condition here
        // condition here
    }
    });

    return products;

}


export async function findById(productId){
    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        },
    });

 
    return product;
}


export async function update(productId, data) {
    const product = await prisma.product.update({
        where: {
            id: productId,
        },
        data,
    });

    return product;
}


export async function deactivate(productId) {
    const product = await prisma.product.update({
        where: {
            id: productId,
        },
        data: {
            status: "INACTIVE",
        },
    });

    return product;
}

export async function reactivate(productId) {
    return await prisma.product.update({
        where: { id: productId },
        data: { status: "ACTIVE" },
    });
}

export default { create, findAll, findById, update, deactivate, reactivate };

