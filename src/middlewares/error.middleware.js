
export default function errorMiddleware(err, req, res, next) {
    const statusCode =
        Number.isInteger(err.statusCode) &&
        err.statusCode >= 400 &&
        err.statusCode <= 599
            ? err.statusCode
            : 500;

    if (statusCode === 500) {
        console.error(err);
    }

    return res.status(statusCode).json({
        status: "failed",
        msg: statusCode === 500
            ? "Internal Server Error"
            : err.message
    });
}
