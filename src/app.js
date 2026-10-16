import express from 'express'
import companyRouter from './routes/company.routes.js'
import errorMiddleware from './middlewares/error.middleware.js';
const app = express()


app.use(express.json())


app.use("/api/v1/companies",companyRouter)


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