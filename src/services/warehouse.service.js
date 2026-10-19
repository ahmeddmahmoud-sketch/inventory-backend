import AppError from "../utils/AppError.js"
import {create, findAll, findById, update, deactivate} from "../repositories/warehouse.repository.js"


export async function createWarehouse(data) {
  // 1. Validate the input object
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("Invalid request data", 400);
  }

  // 2. Validate the warehouse name
  if (typeof data.name !== "string") {
    throw new AppError("Warehouse name is required", 400);
  }

  // 3. Normalize the name
  const name = data.name.trim();

  if (!name) {
    throw new AppError("Warehouse name cannot be empty", 400);
  }

  // 4. Validate maximum length
  if (name.length > 100) {
    throw new AppError(
      "Warehouse name cannot exceed 100 characters",
      400
    );
  }

  // 5. Create the warehouse
  const warehouse = await create({ name });

  // 6. Return the created warehouse
  return warehouse;
}

export async function getAllWarehouses() {
  return await findAll();
}


export async function getWarehouseById(id) {
  // 1. Find warehouse
  const warehouse = await findById(id);
  // 2. Handle not found
  if (!warehouse) {
    throw new AppError("Warehouse not found", 404);
  }
  // 3. Return warehouse
  return warehouse;
}





export async function updateWarehouse(id, data) {
  // 1. Validate the input object
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("Invalid request data", 400);
  }

  // 2. Reject unsupported fields
  const allowedFields = ["name"];

  const unsupportedFields = Object.keys(data).filter(
    (key) => !allowedFields.includes(key)
  );

  if (unsupportedFields.length > 0) {
    throw new AppError("Unsupported update fields", 400);
  }

  // 3. Validate warehouse name
  if (typeof data.name !== "string" || !data.name.trim()) {
    throw new AppError("Warehouse name is required", 400);
  }

  // 4. Normalize the name
  const name = data.name.trim();

  // 5. Validate maximum length
  if (name.length > 100) {
    throw new AppError(
      "Warehouse name cannot exceed 100 characters",
      400
    );
  }

  // 6. Ensure the warehouse exists and is active
  await getWarehouseById(id);

  const updatedWarehouse = await update(id, { name });

  if (!updatedWarehouse) {
    throw new AppError("Warehouse not found or inactive", 404);
  }

  return updatedWarehouse;
}



export async function deactivateWarehouse(id) {
  // 1. Ensure the warehouse exists and is active
  await getWarehouseById(id);

const warehouse = await deactivate(id);

if (!warehouse) {
  throw new AppError("Warehouse not found or inactive", 404);
}

return warehouse;
}
