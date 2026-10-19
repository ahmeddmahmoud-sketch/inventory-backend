import { getAllInventory,getInventoryById} from '../services/inventory.service.js';


export async function getAllInventoryController(req, res) {
    const inventories = await getAllInventory();
    res.status(200).json({
        status: "success",
        results: inventories.length,
        inventories
    });
}   

export async function getInventoryByIdController(req, res) {
    const { id } = req.params;
    const inventory = await getInventoryById(id);
    res.status(200).json({
        status: "success",
        inventory
    });
}