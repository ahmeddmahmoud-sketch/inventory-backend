import express from 'express'
import companyRouter from './routes/company.routes.js'
import productRouter from "./routes/product.routes.js";
import inventoryRouter from "./routes/inventory.routes.js";
import stockMovementRoutes from "./routes/stockMovement.routes.js";
import warehouseRouter from "./routes/warehouse.routes.js";
import userRouter from "./routes/user.routes.js";
import errorMiddleware from './middlewares/error.middleware.js';

const app = express()


app.use(express.json())

// Log incoming requests
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.originalUrl);
  next();
});



app.use("/api/v1/companies",companyRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/warehouses", warehouseRouter)
app.use("/api/v1/inventories", inventoryRouter)
app.use("/api/v1/users", userRouter);
app.use("/api/v1/stock-movements", stockMovementRoutes)    
// Handle unknown routes
app.use((req, res, next) => {
    res.status(404).json({
        status: "failed",
        msg: "Route not found"
    });
});

// Must come after routes
app.use(errorMiddleware);


export default app;