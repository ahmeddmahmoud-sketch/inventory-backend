
import { 
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deactivateProduct,
    reactivateProduct
} from "../services/product.service.js";

export async function createProductController(req, res) {
    const product = await createProduct(req.body);

    return res.status(201).json({
        status: "success",
        product
    });
}


export async function getAllProductsController(req, res) {
    const products = await getAllProducts();
    return res.status(200).json({
        status: "success",
        results: products.length,
        products
    });
}


export async function getProductByIdController(req, res) {
    const productId = req.params.id;
    const product = await getProductById(productId);

    return res.status(200).json({
        status: "success",
        product
    });
}


export async function updateProductController(req, res) {

    const productId = req.params.id;
    const updatedProduct = await updateProduct(productId, req.body);

    return res.status(200).json({
        status: "success",
        updatedProduct
    });
}


export async function deactivateProductController(req, res) {
    const productId = req.params.id;

    const deactivatedProduct = await deactivateProduct(productId);

    return res.status(200).json({
        status: "success",
        deactivatedProduct
    }); 
}

export async function reactivateProductController(req, res) {
    const product = await reactivateProduct(req.params.id);
    return res.status(200).json({
        status: "success",
        reactivatedProduct: product
    });
}
