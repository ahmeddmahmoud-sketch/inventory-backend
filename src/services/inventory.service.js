import {findAll,findById} from '../repositories/inventory.repository.js';
import AppError from "../utils/AppError.js";


export async function getAllInventory() {
  // Your code here
  const inventories = await findAll();
  return inventories;
}


export async function getInventoryById(id) {
  const inventory = await findById(id);

  if (!inventory) {
    throw new AppError(`Inventory with ID ${id} not found`, 404);
  }

  return inventory;
}