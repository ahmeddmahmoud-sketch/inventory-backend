import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import productRepository from "../repositories/product.repository.js";
import companyRepository from "../repositories/company.repository.js";
import AppError from "../utils/AppError.js";
import { validationResult } from "express-validator";
import { ProductIdValidation, updateProductValidation } from "../validations/product.validation.js";
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deactivateProduct,
    reactivateProduct
} from "../services/product.service.js";

const product = {
    id: "4b41c960-4d50-4da7-97ce-375d12c69d42",
    name: "Widget",
    sku: "WIDGET-1",
    price: "12.50",
    status: "ACTIVE",
    companyId: "637c3b38-f08b-4ef4-ac68-9a539d7f127d"
};

const originalProductMethods = { ...productRepository };
const originalCompanyFindById = companyRepository.findById;

beforeEach(() => {
    Object.assign(productRepository, originalProductMethods);
    companyRepository.findById = async () => ({ id: product.companyId, isDeleted: false });
});

afterEach(() => {
    Object.assign(productRepository, originalProductMethods);
    companyRepository.findById = originalCompanyFindById;
});

async function expectAppError(promise, statusCode) {
    await assert.rejects(promise, error => error instanceof AppError && error.statusCode === statusCode);
}

async function hasValidationErrors(chains, req) {
    for (const chain of chains) await chain.run(req);
    return validationResult(req).array();
}

test("validates product UUIDs and rejects empty or unsupported PATCH bodies", async () => {
    const invalidIdErrors = await hasValidationErrors(ProductIdValidation, {
        params: { id: "not-a-uuid" }, body: {}, query: {}
    });
    assert.ok(invalidIdErrors.length > 0);

    for (const body of [{}, { status: "INACTIVE" }, { companyId: product.companyId }]) {
        const errors = await hasValidationErrors(updateProductValidation, {
            params: { id: product.id }, body, query: {}
        });
        assert.ok(errors.length > 0);
    }
});

test("creates a normalized product and preserves returned Decimal-like price", async () => {
    let input;
    productRepository.create = async data => { input = data; return { ...product, ...data, price: { toString: () => "12.50" } }; };
    const result = await createProduct({ ...product, name: "  Widget ", sku: " widget-1 " , price: 12.5 });
    assert.equal(input.name, "Widget");
    assert.equal(input.sku, "WIDGET-1");
    assert.equal(result.price.toString(), "12.50");
});

for (const [label, payload] of [
    ["missing name", { sku: "A", price: 1, companyId: product.companyId }],
    ["empty name", { name: "  ", sku: "A", price: 1, companyId: product.companyId }],
    ["missing SKU", { name: "A", price: 1, companyId: product.companyId }],
    ["empty SKU", { name: "A", sku: "  ", price: 1, companyId: product.companyId }],
    ["non-numeric price", { name: "A", sku: "A", price: "1", companyId: product.companyId }],
    ["zero price", { name: "A", sku: "A", price: 0, companyId: product.companyId }],
    ["negative price", { name: "A", sku: "A", price: -1, companyId: product.companyId }],
    ["infinite price", { name: "A", sku: "A", price: Infinity, companyId: product.companyId }]
]) {
    test(`rejects ${label}`, async () => expectAppError(createProduct(payload), 400));
}

test("rejects a missing or logically deleted company", async () => {
    companyRepository.findById = async () => null;
    await expectAppError(createProduct({ ...product, price: 1 }), 404);
});

test("maps a database SKU unique violation to conflict", async () => {
    productRepository.create = async () => { throw { code: "P2002", meta: { target: ["sku"] } }; };
    await expectAppError(createProduct({ ...product, price: 1 }), 409);
});

test("returns only the repository's active listing and retrieves products", async () => {
    productRepository.findAll = async () => [product];
    productRepository.findById = async id => id === product.id ? product : null;
    assert.deepEqual(await getAllProducts(), [product]);
    assert.equal(await getProductById(product.id), product);
    await expectAppError(getProductById("missing"), 404);
});

test("updates supported fields after normalization", async () => {
    productRepository.findById = async () => product;
    productRepository.update = async (_id, data) => data;
    assert.deepEqual(await updateProduct(product.id, { name: " New ", sku: " new-sku " }), { name: "New", sku: "NEW-SKU" });
});

test("rejects empty update data and unsupported fields", async () => {
    productRepository.findById = async () => product;
    await expectAppError(updateProduct(product.id, {}), 400);
    await expectAppError(updateProduct(product.id, { status: "INACTIVE" }), 400);
    await expectAppError(updateProduct(product.id, { id: "other" }), 400);
    await expectAppError(updateProduct(product.id, { companyId: "other" }), 400);
});

test("rejects invalid update values and maps duplicate SKU", async () => {
    productRepository.findById = async () => product;
    await expectAppError(updateProduct(product.id, { price: NaN }), 400);
    productRepository.update = async () => { throw { code: "P2002", meta: { target: ["sku"] } }; };
    await expectAppError(updateProduct(product.id, { sku: "TAKEN" }), 409);
});

test("deactivates and reactivates the existing record, and returns 404 for missing products", async () => {
    productRepository.findById = async () => product;
    productRepository.deactivate = async () => ({ ...product, status: "INACTIVE" });
    productRepository.reactivate = async () => ({ ...product, status: "ACTIVE" });
    assert.equal((await deactivateProduct(product.id)).status, "INACTIVE");
    assert.equal((await reactivateProduct(product.id)).status, "ACTIVE");
    productRepository.findById = async () => null;
    await expectAppError(deactivateProduct(product.id), 404);
    await expectAppError(reactivateProduct(product.id), 404);
});

test("maps a missing product from a write race to 404 and does not mislabel unrelated Prisma errors", async () => {
    productRepository.findById = async () => product;
    productRepository.update = async () => { throw { code: "P2025" }; };
    await expectAppError(updateProduct(product.id, { name: "Updated" }), 404);
    productRepository.update = async () => { throw { code: "P2003" }; };
    await assert.rejects(updateProduct(product.id, { name: "Updated" }), error => error.code === "P2003");
});
