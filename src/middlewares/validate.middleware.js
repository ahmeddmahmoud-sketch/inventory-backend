
import { validationResult } from "express-validator";


export default function validateMiddleware(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "failed",
            errors: errors.array().map(error => ({
                field: error.path,
                msg: error.msg
            }))
        });
    }

    next();
}
