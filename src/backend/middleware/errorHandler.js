// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Validation error
    if (err.array) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.array()
        });
    }

    // MySQL error
    if (err.code && err.code.startsWith('ER_')) {
        return res.status(400).json({
            success: false,
            message: 'Database error',
            error: err.message
        });
    }

    // Generic error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};

module.exports = errorHandler;
