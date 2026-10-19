import {
    deactivateWarehouse,
    updateWarehouse,
    getWarehouseById,
    createWarehouse,
    getAllWarehouses,
} from '../services/warehouse.service.js';

export async function createWarehouseController(req, res) {
  // 1. Get data from req.body
  const warehouseData = req.body;
  // 2. Call the service
  const warehouse = await createWarehouse(warehouseData);
  // 3. Return 201 with the created warehouse
  res.status(201).json({
    status: "success",
    warehouse,
  });
}   



export async function getAllWarehousesController(req, res) {
  // Your code here
    const warehouses = await getAllWarehouses();

    res.status(200).json({
        status: "success",
        results: warehouses.length,
        warehouses,
    });
}




export async function getWarehouseByIdController(req, res) {
  // 1. Extract id from req.params
  const warehouseId = req.params.id;
  // 2. Call the service
    const warehouse = await getWarehouseById(warehouseId);
  // 3. Return status 200 with the warehouse
    res.status(200).json({
        status: "success",
        warehouse,
    }); 
}


export async function updateWarehouseController(req, res) {
  // 1. Extract id from req.params
  const warehouseId = req.params.id;
  // 2. Get update data from req.body
    const updateData = req.body;
  // 3. Call the service
    const updatedWarehouse = await updateWarehouse(warehouseId, updateData);
  // 4. Return status 200 with the updated warehouse
    res.status(200).json({
        status: "success",
        warehouse: updatedWarehouse,
    });
}


export async function deactivateWarehouseController(req, res) {
  // 1. Extract warehouse id
  const warehouseId = req.params.id;
  // 2. Call the service
  const deactivatedWarehouse = await deactivateWarehouse(warehouseId);
  // 3. Return status 200 with the deactivated warehouse
  res.status(200).json({
    status: "success",
    warehouse: deactivatedWarehouse,
  });
}