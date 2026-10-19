
import {
  createStockMovement,
  getAllStockMovements,
  getStockMovementById,
} from "../services/stockMovement.service.js";

export async function createStockMovementController(req, res) {
  const result = await createStockMovement(req.body);

  res.status(201).json({
    status: "success",
    message: "Stock movement created successfully",
    data: result,
  });
}



export async function getAllStockMovementsController(req, res) {
  const result = await getAllStockMovements(req.query);

  res.status(200).json({
    status: "success",
    results: result.movements.length,
    pagination: result.pagination,
    data: result.movements,
  });
}

export async function getStockMovementByIdController(req, res) {
  const { id } = req.params;

  const movement = await getStockMovementById(id);

  res.status(200).json({
    status: "success",
    data: movement,
  });
}
