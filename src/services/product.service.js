import productRepository from "../repositories/product.repository.js"
import companyRepository from "../repositories/company.repository.js"
import AppError from "../utils/AppError.js";

function isSkuConflict(error) {
    return error?.code === "P2002" &&
        (!Array.isArray(error.meta?.target) || error.meta.target.includes("sku"));
}

function normalizeCreateData(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new AppError("Request body must be an object", 400);
    }

    if (typeof data.name !== "string" || !data.name.trim() || data.name.trim().length > 100) {
        throw new AppError("Product name must be a non-empty string with a maximum of 100 characters", 400);
    }
    if (typeof data.sku !== "string" || !data.sku.trim() || data.sku.trim().length > 50) {
        throw new AppError("Product SKU must be a non-empty string with a maximum of 50 characters", 400);
    }
    if (typeof data.price !== "number" || !Number.isFinite(data.price) || data.price <= 0) {
        throw new AppError("Price must be a positive number", 400);
    }
    if (typeof data.companyId !== "string" || !data.companyId) {
        throw new AppError("Company ID is required", 400);
    }

    return {
        name: data.name.trim(),
        sku: data.sku.trim().toUpperCase(),
        price: data.price,
        companyId: data.companyId
    };
}

function handleProductWriteError(error, missingMessage = "Product not found") {
    if (isSkuConflict(error)) {
        throw new AppError("A product with this SKU already exists", 409);
    }
    if (error?.code === "P2025") {
        throw new AppError(missingMessage, 404);
    }
    throw error;
}

export async function createProduct(data) {
    const cleanedData = normalizeCreateData(data);
    const company = await companyRepository.findById(cleanedData.companyId);
    if (!company) {
        throw new AppError("Company not found or unavailable", 404);
    }
    try {
        return await productRepository.create(cleanedData);
    } catch (error) {
        handleProductWriteError(error);
    }
}



export async function getAllProducts() {

        return await productRepository.findAll();
}


export async function getProductById(productId) {
    const product = await productRepository.findById(productId);

    if (!product) {
        throw new AppError("Product not found", 404);
    }
    return product;
}

export async function updateProduct(productId, data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new AppError("Request body must be an object", 400);
    }
    const allowedFields = new Set(["name", "sku", "price"]);
    const unsupportedFields = Object.keys(data).filter(field => !allowedFields.has(field));
    if (unsupportedFields.length) {
        throw new AppError(`Unsupported field: ${unsupportedFields.join(", ")}`, 400);
    }

    // 1. Check if the product exists
    const existingProduct = await productRepository.findById(productId);

    if (!existingProduct) {
        throw new AppError("Product not found", 404);
    }

    // 2. Build a new object containing only allowed fields
    const cleanedData = {};

    if (data.name !== undefined) {
        if (
            typeof data.name !== "string" ||
            !data.name.trim() ||
            data.name.trim().length > 100
        ) {
            throw new AppError(
                "Product name must be a non-empty string with a maximum of 100 characters",
                400
            );
        }

        cleanedData.name = data.name.trim();
    }

    if (data.price !== undefined) {
        if (
            typeof data.price !== "number" ||
            !Number.isFinite(data.price) ||
            data.price <= 0
        ) {
            throw new AppError("Price must be a positive number", 400);
        }

        cleanedData.price = data.price;
    }

    if (data.sku !== undefined) {
        if (
            typeof data.sku !== "string" ||
            !data.sku.trim() ||
            data.sku.trim().length > 50
        ) {
            throw new AppError(
                "Product SKU must be a non-empty string with a maximum of 50 characters",
                400
            );
        }

        cleanedData.sku = data.sku.trim().toUpperCase();
    }

    // 3. Reject requests with no editable fields
    if (Object.keys(cleanedData).length === 0) {
        throw new AppError("Provide at least one valid field to update", 400);
    }

    // 4. Update the product
    try {
        return await productRepository.update(productId, cleanedData);
    } catch (error) {
        handleProductWriteError(error);
    }
}

    
export async function deactivateProduct(productId) {
    const existingProduct = await productRepository.findById(productId);

    if (!existingProduct) {
        throw new AppError("Product not found", 404);
    }

    return await productRepository.deactivate(productId);

    
}

export async function reactivateProduct(productId) {
    const existingProduct = await productRepository.findById(productId);
    if (!existingProduct) {
        throw new AppError("Product not found", 404);
    }
    return await productRepository.reactivate(productId);
}
