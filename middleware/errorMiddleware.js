const APIError = require("../utils/apiError");

const sendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });

const sendErrorForprod = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
const handleJwtInvalidSignature = () =>
  new APIError("invalid token please login again..", 401);

const handleJwtExpired = () =>
  new APIError("expired token please login again..", 401);

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();
    if (err.name === "TokenExpiredError") err = handleJwtExpired();
    sendErrorForprod(err, res);
  }
};

module.exports = globalError;
