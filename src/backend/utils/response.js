// Response utility
const sendResponse = (res, statusCode, success, message, data = null, error = null) => {
    res.status(statusCode).json({
        success,
        message,
        data,
        error
    });
};

// Success response
const successResponse = (res, statusCode, message, data = null) => {
    sendResponse(res, statusCode, true, message, data);
};

// Error response
const errorResponse = (res, statusCode, message, error = null) => {
    sendResponse(res, statusCode, false, message, null, error);
};

module.exports = {
    sendResponse,
    successResponse,
    errorResponse
};
