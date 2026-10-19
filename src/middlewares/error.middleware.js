export default function errorMiddleware(err, req, res, next) {
  // Invalid JSON body
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      status: "failed",
      msg: "Invalid JSON request body",
    });
  }

  // Prisma known request errors
  if (err.code === "P2002") {
    return res.status(409).json({
      status: "failed",
      msg: "A record with this unique value already exists",
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      status: "failed",
      msg: "Requested record was not found",
    });
  }

  if (err.code === "P2003") {
    return res.status(409).json({
      status: "failed",
      msg: "Operation conflicts with related records",
    });
  }

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
    msg:
      statusCode === 500
        ? "Internal Server Error"
        : err.message,
  });
}
