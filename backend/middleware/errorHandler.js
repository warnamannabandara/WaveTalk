const errorHandler = (err, req, res, next) => {
    let status = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        status = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(e => e.message).join(', ');
        status = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token';
        status = 401;
    }
    if (err.name === 'TokenExpiredError') {
        message = 'Token expired';
        status = 401;
    }

    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    res.status(status).json({ message, ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) });
};

module.exports = errorHandler;
