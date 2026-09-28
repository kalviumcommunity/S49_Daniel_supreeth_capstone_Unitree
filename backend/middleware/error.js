// Wraps async route handlers so thrown errors reach the error handler
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const notFound = (req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message || "Server error";

    if (err.name === "ValidationError") {
        status = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    } else if (err.name === "CastError") {
        status = 400;
        message = `Invalid ${err.path}`;
    } else if (err.code === 11000) {
        status = 400;
        message = `${Object.keys(err.keyValue || {}).join(", ") || "Value"} already exists`;
    } else if (err.type === "entity.too.large") {
        status = 413;
        message = "Upload is too large. Try smaller images.";
    }

    if (status >= 500) console.error(err);
    res.status(status).json({ message });
};

module.exports = { asyncHandler, HttpError, notFound, errorHandler };
